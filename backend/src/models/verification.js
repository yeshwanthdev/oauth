const rm = require('@root/rm'),
	mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
	...rm.utils.commonSchema,

	userId: { type: rm.mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
	type: { type: String, required: true },
	expiresAt: { type: Date, required: true, default: rm.utils.date.oneYearFromNow },
});

const VerificationModel = mongoose.model('Verification', verificationSchema);
module.exports = VerificationModel;
