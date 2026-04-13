const nodemailer = require('nodemailer');

class EmailService {
	constructor(config) {
		this.config = config;
		this.init();
	}

	init() {
		this.transporter = nodemailer.createTransport({
			host: this.config.host,
			port: this.config.port,
			secure: false,
			auth: {
				user: this.config.username,
				pass: this.config.password,
			},
		});
	}

	async sendEmail(options) {
		const mailOptions = {
			...options,
			from: options.from,
			to: options.to,
			subject: options.subject,
			text: options.text,
		};

		try {
			const info = await this.transporter.sendMail(mailOptions);
			console.log(`Email sent successfully. Message ID: ${info.messageId}`);
			return {
				messageId: info.messageId,
				envelope: info.envelope,
				accepted: info.accepted,
				rejected: info.rejected,
			};
		} catch (error) {
			console.error('Failed to send email:', error);
			throw new Error(`Email sending failed: ${error.message}`);
		}
	}

	async sendBulkEmails() { }
}

module.exports = EmailService;
