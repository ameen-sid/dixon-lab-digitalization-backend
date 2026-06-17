import { prisma } from '../configs/prisma.config';
import logger from '../configs/logger.config';

export class ResourceCleanupService {
	static startPeriodicCleanup() {
		// Run on startup
		this.cleanupExpiredResources()
			.catch(err => logger.error('Error running initial resource cleanup:', err));

		// Run every hour (3600000 ms)
		setInterval(() => {
			this.cleanupExpiredResources()
				.catch(err => logger.error('Error running periodic resource cleanup:', err));
		}, 60 * 60 * 1000);
	}

	static async cleanupExpiredResources() {
		logger.info('Starting periodic resource cleanup check...');
		const now = new Date();

		try {
			// 1. Release Normal Platforms where occupiedUntil has passed
			const releasedNormalByDate = await prisma.platformAvailability.updateMany({
				where: {
					isAvailable: false,
					occupiedUntil: {
						lt: now
					}
				},
				data: {
					isAvailable: true,
					occupiedBy: null,
					testRequestId: null,
					modelNo: null,
					occupiedUntil: null
				}
			});

			if (releasedNormalByDate.count > 0) {
				logger.info(`Released ${releasedNormalByDate.count} normal platforms due to occupiedUntil expiration.`);
			}

			// 2. Release NABL Platforms where occupiedUntil has passed
			const releasedNablByDate = await prisma.nablStationAvailability.updateMany({
				where: {
					isAvailable: false,
					occupiedUntil: {
						lt: now
					}
				},
				data: {
					isAvailable: true,
					occupiedBy: null,
					testRequestId: null,
					modelNo: null,
					occupiedUntil: null
				}
			});

			if (releasedNablByDate.count > 0) {
				logger.info(`Released ${releasedNablByDate.count} NABL platforms due to occupiedUntil expiration.`);
			}

			// 3. Release Testing Equipment where occupiedUntil has passed
			const releasedEqByDate = await prisma.testingEquipment.updateMany({
				where: {
					isAvailable: false,
					occupiedUntil: {
						lt: now
					}
				},
				data: {
					isAvailable: true,
					occupiedBy: null,
					testRequestId: null,
					modelNo: null,
					occupiedUntil: null
				}
			});

			if (releasedEqByDate.count > 0) {
				logger.info(`Released ${releasedEqByDate.count} testing equipments due to occupiedUntil expiration.`);
			}

			// 4. Release resources based on TestPlan validity / associated TestRequest completion
			const todayStr = now.toISOString().split('T')[0];
			
			const expiredPlans = await prisma.testPlan.findMany({
				where: {
					OR: [
						// Case A: End date has passed
						{
							endDate: {
								lt: todayStr
							}
						},
						// Case B: Evaluation is done
						{
							evaluationStatus: {
								in: ['PASSED', 'FAILED']
							}
						},
						// Case C: The request status is finalized
						{
							testRequest: {
								status: {
									in: ['COMPLETED', 'FAILED', 'RETEST', 'REJECTED', 'INSPECTION_FAILED', 'TESTING_FAILED', 'TESTING_PARTIAL', 'TESTING_COMPLETED']
								}
							}
						}
					]
				},
				include: {
					testRequest: true,
					testType: true
				}
			});

			let releasedPlatformsCount = 0;
			let releasedEquipmentsCount = 0;

			for (const plan of expiredPlans) {
				// Parse platform numbers
				let platformNos: number[] = [];
				if (plan.platformNos) {
					try {
						const parsed = typeof plan.platformNos === 'string' ? JSON.parse(plan.platformNos) : plan.platformNos;
						platformNos = Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
					} catch (e) {
						platformNos = [];
					}
				}

				const isNablType = plan.testType?.name?.toLowerCase().includes('nabl') || false;

				if (platformNos.length > 0 && plan.stationNo) {
					if (isNablType) {
						const res = await prisma.nablStationAvailability.updateMany({
							where: {
								stationNo: String(plan.stationNo),
								platformNo: {
									in: platformNos.map(String)
								},
								testRequestId: plan.testRequestId,
								isAvailable: false
							},
							data: {
								isAvailable: true,
								occupiedBy: null,
								testRequestId: null,
								modelNo: null,
								occupiedUntil: null
							}
						});
						releasedPlatformsCount += res.count;
					} else {
						const res = await prisma.platformAvailability.updateMany({
							where: {
								stationNo: String(plan.stationNo),
								platformNo: {
									in: platformNos.map(String)
								},
								testRequestId: plan.testRequestId,
								isAvailable: false
							},
							data: {
								isAvailable: true,
								occupiedBy: null,
								testRequestId: null,
								modelNo: null,
								occupiedUntil: null
							}
						});
						releasedPlatformsCount += res.count;
					}
				}

				if (plan.equipmentId) {
					const res = await prisma.testingEquipment.updateMany({
						where: {
							id: plan.equipmentId,
							testRequestId: plan.testRequestId,
							isAvailable: false
						},
						data: {
							isAvailable: true,
							occupiedBy: null,
							testRequestId: null,
							modelNo: null,
							occupiedUntil: null
						}
					});
					releasedEquipmentsCount += res.count;
				}
			}

			if (releasedPlatformsCount > 0 || releasedEquipmentsCount > 0) {
				logger.info(`Released ${releasedPlatformsCount} platforms and ${releasedEquipmentsCount} equipments based on TestPlan expiry/completion.`);
			}

			// 5. Sweep and release any remaining/orphaned reservations for finalized requests
			const finalizedRequests = await prisma.testRequest.findMany({
				where: {
					status: {
						in: ['COMPLETED', 'FAILED', 'RETEST', 'REJECTED', 'INSPECTION_FAILED', 'TESTING_FAILED', 'TESTING_PARTIAL', 'TESTING_COMPLETED']
					}
				},
				select: {
					id: true
				}
			});

			const finalizedRequestIds = finalizedRequests.map(r => r.id);

			if (finalizedRequestIds.length > 0) {
				const releasedNormalByRequest = await prisma.platformAvailability.updateMany({
					where: {
						isAvailable: false,
						testRequestId: {
							in: finalizedRequestIds
						}
					},
					data: {
						isAvailable: true,
						occupiedBy: null,
						testRequestId: null,
						modelNo: null,
						occupiedUntil: null
					}
				});

				const releasedNablByRequest = await prisma.nablStationAvailability.updateMany({
					where: {
						isAvailable: false,
						testRequestId: {
							in: finalizedRequestIds
						}
					},
					data: {
						isAvailable: true,
						occupiedBy: null,
						testRequestId: null,
						modelNo: null,
						occupiedUntil: null
					}
				});

				const releasedEqByRequest = await prisma.testingEquipment.updateMany({
					where: {
						isAvailable: false,
						testRequestId: {
							in: finalizedRequestIds
						}
					},
					data: {
						isAvailable: true,
						occupiedBy: null,
						testRequestId: null,
						modelNo: null,
						occupiedUntil: null
					}
				});

				if (releasedNormalByRequest.count > 0 || releasedNablByRequest.count > 0 || releasedEqByRequest.count > 0) {
					logger.info(`Cleaned up resources for finalized requests. Normal platforms: ${releasedNormalByRequest.count}, NABL platforms: ${releasedNablByRequest.count}, Equipments: ${releasedEqByRequest.count}`);
				}
			}

			logger.info('Completed periodic resource cleanup check.');
		} catch (error) {
			logger.error('Error during expired resource cleanup:', error);
		}
	}
}