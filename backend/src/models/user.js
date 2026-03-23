const rm = require('@root/rm'),
	mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	...rm.utils.commonSchema,

	code: { type: String, default: rm.utils.guid },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	verified: { type: Boolean, required: true, default: false },
});

userSchema.pre('save', async function () {
	if (!this.isModified('password')) return;

	this.password = await rm.utils.bcrypt.hash(this.password);
	return;
});

userSchema.methods.comparePassword = async function (value) {
	return rm.utils.bcrypt.compare(value, this.password);
};

userSchema.methods.omitPassword = function () {
	const user = this.toObject();
	delete user.password;
	return user;
};

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;
