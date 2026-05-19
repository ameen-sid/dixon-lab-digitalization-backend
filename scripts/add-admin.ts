import { prisma } from '../src/configs/prisma.config';
import bcrypt from 'bcrypt';

async function main() {

	const username = 'admin';
	const password = 'admin';

	console.log('Seeding admin user...');
	const existingUser = await prisma.user.findUnique({ where: { username } });
	if (existingUser) {
		console.log(`User '${username}' already exists. Skipping.`);
		return;
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	const adminUser = await prisma.user.create({
		data: {
			name: 'System Administrator',
			username: username,
			password: hashedPassword,
			role: 'Admin',
			departmentId: null
		}
	});

	console.log('Admin user seeded successfully:', {
		id: adminUser.id,
		name: adminUser.name,
		username: adminUser.username,
		role: adminUser.role
	});
}

main()
	.catch((e) => {
		console.error('Error seeding admin user:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});