const rm = require('@root/rm'),
	uuid = require('uuid').v4,
	bcrypt = require('./bcrypt'),
	date = require('./date');

class Utils {
	guid() {
		return uuid();
	}

	get UTCDateNow() {
		const isoDate = new Date().toISOString();
		return Date.now(isoDate);
	}

	get date() {
		return date;
	}

	get bcrypt() {
		return bcrypt;
	}

	get commonSchema() {
		return {
			code: { type: String, default: this.guid },
			dateCreated: { type: Date, default: rm.utils.UTCDateNow },
			dateModified: { type: Date, default: rm.utils.UTCDateNow },
			createdBy: { type: rm.mongoose.Schema.Types.ObjectId, ref: 'users' },
			modifiedBy: { type: rm.mongoose.Schema.Types.ObjectId, ref: 'users' },
			json: { type: Object },
			status: { type: Boolean, default: true },
		};
	}
}

module.exports = new Utils();
