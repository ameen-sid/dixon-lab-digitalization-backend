import { MailService } from '../services/mail.service';

export class MailFactory {

	private static mailService: MailService;

	static getMailService(): MailService {
		if (!this.mailService)	this.mailService = new MailService();
		return this.mailService;
	}
}