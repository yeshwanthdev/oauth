const rm = require('@root/rm'),
	mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
	...rm.utils.commonSchema,

	userId: { type: rm.mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
	userAgent: { type: String },
	expiresAt: { type: Date, required: true, default: rm.utils.date.thirtyDaysFromNow },
});

const SessionModel = mongoose.model('Session', sessionSchema);
module.exports = SessionModel;
