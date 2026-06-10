import nodemailer from 'nodemailer';
import { serverConfig } from '../configs';
import logger from '../configs/logger.config';

export interface IMailService {
	sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean>;
}

export class MailService implements IMailService {

	private transporter: nodemailer.Transporter | null = null;
	private isMockMode: boolean = false;

	constructor() {
		const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = serverConfig;

		if (!SMTP_USER || SMTP_USER === 'placeholder@gmail.com' || !SMTP_PASS || SMTP_PASS === 'your_gmail_app_password') {
			logger.warn('MailService initialized in MOCK mode (SMTP credentials are not configured). Emails will be logged to system logs instead of being sent.');
			this.isMockMode = true;
		} 
		else {
			try {
				this.transporter = nodemailer.createTransport({
					host: SMTP_HOST,
					port: SMTP_PORT,
					secure: SMTP_PORT === 465,
					auth: {
						user: SMTP_USER,
						pass: SMTP_PASS,
					}
				});
				logger.info(`MailService SMTP transporter initialized for host: ${SMTP_HOST}:${SMTP_PORT}`);
			} catch (error) {
				logger.error('Failed to initialize SMTP Mail transporter. Falling back to MOCK mode.', { error });
				this.isMockMode = true;
			}
		}
	}

	async sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
		
		const from = serverConfig.SMTP_FROM;
		if (this.isMockMode || !this.transporter) {
			logger.info('SMTP Send Mail (MOCKED):', {
				from,
				to,
				subject,
				text: text || '(No plain text alternative provided)',
				html: html.substring(0, 500) + (html.length > 500 ? '...' : '')
			});
			return true;
		}

		try {
			const info = await this.transporter.sendMail({
				from,
				to,
				subject,
				html,
				text,
			});
			logger.info('Email sent successfully via SMTP', { messageId: info.messageId, to, subject });
			return true;
		} catch (error) {
			logger.error('Failed to send email via SMTP', {
				to,
				subject,
				error: error instanceof Error ? error.message : error
			});
			return false;
		}
	}
}