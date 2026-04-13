const env = {
	environment: process.env.ENV,
	PORT: process.env.PORT || 5000,
	MONGODB_URI: process.env.MONGODB_URI,
	APP_ORIGIN: process.env.APP_ORIGIN,
	jwt: {
		secret: process.env.JWT_SECRET,
		expiresIn: 36000,
		refreshSecret: process.env.JWT_REFRESH_SECRET,
		expiryInSec: 36000,
	},
	smtp: {
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT,
		username: process.env.SMTP_USERNAME,
		password: process.env.SMTP_PASSWORD,
	},
};

module.exports = env;
