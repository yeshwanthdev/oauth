const rm = require('@root/rm');
const { z } = require('zod');
const UserModel = require('@model/user');
const VerificationModel = require('@model/verification');
const SessionModel = require('@model/session');
const AppError = require('@helper/app-error');
const notificationWrapper = require('./notification');

//constants
const REFRESH_PATH = '/auth/refresh';

//schemas
const registerSchema = z
	.object({
		email: z.string().email().min(1).max(255),
		password: z.string().min(6).max(255),
		confirmPassword: z.string().min(6).max(255),
		userAgent: z.string().optional(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});
const loginSchema = z.object({
	email: z.string().email().min(1).max(255),
	password: z.string().min(6).max(255),
	userAgent: z.string().optional(),
});
const verifyEmailSchema = z.string().uuid();
const forgotPasswordSchema = z.string().email().min(1).max(255);
const resetPasswordSchema = z.object({ password: z.string().min(6).max(255), verificationCode: z.string().uuid() });

//body validations
const validteUser = (data) => registerSchema.parse(data);
const validteLoginUser = (data) => loginSchema.parse(data);
const validateVerifyEmail = (data) => verifyEmailSchema.parse(data);
const validateForgotPassword = (data) => forgotPasswordSchema.parse(data);
const validateResetPassword = (data) => resetPasswordSchema.parse(data);

//create user
const createAccount = async (data) => {
	const user = await UserModel.findOne({ email: data.email });
	if (!rm._.isEmpty(user)) rm.assert(rm.enums.httpStatus.BAD_REQUEST, 'User already exists');

	//create user
	const newUser = await UserModel.create({ email: data.email, password: data.password });
	const userId = newUser._id;

	//create verification
	const verificationCode = await VerificationModel.create({ userId, type: rm.enums.verificationType.EMAILVERIFICATION });

	// send verification email
	await notificationWrapper.verification({ code: verificationCode.code, expiresAt: verificationCode.expiresAt });

	// create session
	const session = await SessionModel.create({ userId: userId, userAgent: data.userAgent });

	const refreshToken = rm.jwt.sign(
		{
			sessionId: session._id,
		},
		rm.config.jwt.secret,
		{
			expiresIn: '30d',
		}
	);

	const accessToken = rm.jwt.sign(
		{
			userId: userId,
			sessionId: session._id,
		},
		rm.config.jwt.secret,
		{
			expiresIn: rm.config.jwt.expiresIn,
		}
	);

	return {
		user: newUser.omitPassword(),
		accessToken,
		refreshToken,
	};
};

//set cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
	res.cookie('accessToken', accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 15 * 60 * 1000, // 15 minutes
	});
	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		path: REFRESH_PATH,
		sameSite: 'strict',
		maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
	});
};

//clear cookies
const clearAuthCookies = (res) => res.clearCookie('accessToken').clearCookie('refreshToken', { path: REFRESH_PATH });

const loginUser = async (data) => {
	const user = await UserModel.findOne({ email: data.email });
	if (rm._.isEmpty(user)) rm.assert(rm.enums.httpStatus.BAD_REQUEST, 'Invalid email or password');

	const isValid = await user.comparePassword(data.password);
	if (!isValid) rm.assert(rm.enums.httpStatus.BAD_REQUEST, 'Invalid email or password');

	const userId = user._id;

	// create session
	const session = await SessionModel.create({ userId: userId, userAgent: data.userAgent });

	const refreshToken = rm.jwt.sign(
		{
			sessionId: session._id,
		},
		rm.config.jwt.secret,
		{
			expiresIn: '30d',
		}
	);

	const accessToken = rm.jwt.sign(
		{
			userId: userId,
			sessionId: session._id,
		},
		rm.config.jwt.secret,
		{
			expiresIn: rm.config.jwt.expiresIn,
		}
	);

	return {
		user: user.omitPassword(),
		accessToken,
		refreshToken,
	};
};

const logoutUser = async (token) => {
	const payload = rm.jwt.verify(token, rm.config.jwt.secret);

	// clear session
	if (payload.sessionId) await SessionModel.deleteOne({ _id: payload.sessionId });
};

const verifyEmail = async (code) => {
	const validCode = await VerificationModel.findOne({
		code: code,
		type: rm.enums.verificationType.EMAILVERIFICATION,
		expiresAt: { $gt: new Date() },
	});

	if (rm._.isEmpty(validCode)) rm.assert(rm.enums.httpStatus.BAD_REQUEST, 'Invalid or expired verification code');

	const updatedUser = await UserModel.findByIdAndUpdate(validCode.userId, { verified: true }, { new: true });

	if (rm._.isEmpty(updatedUser)) rm.assert(rm.enums.httpStatus.BAD_REQUEST, 'Failed to verify email');

	await VerificationModel.deleteOne({ code });
};

const forgotPassword = async (email) => {
	try {

		const user = await UserModel.findOne({ email });
		if (rm._.isEmpty(user)) rm.assert('User not found');

		// check for max password reset requests (2 emails in 5min)
		const fiveMinAgo = rm.utils.date.fiveMinutesAgo();
		const count = await VerificationModel.countDocuments({
			userId: user._id,
			type: rm.enums.verificationType.PASSWORDRESET,
			dateCreated: { $gt: fiveMinAgo },
		});
		if (count > 2) rm.assert(rm.enums.httpStatus.TOO_MANY_REQUESTS, 'Too many requests, please try again later');

		const expiresAt = rm.utils.date.oneHourFromNow();
		const verificationCode = await VerificationModel.create({
			userId: user._id,
			type: rm.enums.verificationType.PASSWORDRESET,
			expiresAt,
		});

		await notificationWrapper.forgotPassword({ code: verificationCode.code, expiresAt: verificationCode.expiresAt });

	} catch (error) {
		console.log('SendPasswordResetError:', error.message);
		return {};
	}
};

const resetPassword = async (data) => {
	const validCode = await VerificationModel.findOne({
		code: data.verificationCode,
		type: rm.enums.verificationType.PASSWORDRESET,
		expiresAt: { $gt: new Date() },
	});

	if (rm._.isEmpty(validCode)) rm.assert(rm.enums.httpStatus.NOT_FOUND, 'Invalid or expired verification code');

	const password = await rm.utils.bcrypt.hash(data.password);
	const updatedUser = await UserModel.findByIdAndUpdate(validCode.userId, { password: password });

	if (rm._.isEmpty(updatedUser)) rm.assert(rm.enums.httpStatus.INTERNAL_SERVER_ERROR, 'Failed to reset password');

	await VerificationModel.deleteOne({ code: data.verificationCode });

	// delete all sessions
	await SessionModel.deleteMany({ userId: validCode.userId });

	return { user: updatedUser.omitPassword() };
};

module.exports = {
	validteUser,
	validteLoginUser,
	validateVerifyEmail,
	validateForgotPassword,
	validateResetPassword,
	createAccount,
	loginUser,
	logoutUser,
	verifyEmail,
	forgotPassword,
	resetPassword,
	setAuthCookies,
	clearAuthCookies,
};
