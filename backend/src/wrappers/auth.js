const rm = require('@root/rm');
const { z } = require('zod');
const UserModel = require('@model/user');
const VerificationModel = require('@model/verification');
const SessionModel = require('@model/session');

//constants
const REFRESH_PATH = '/auth/refresh';

//register schema
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

//login schema
const loginSchema = z.object({
	email: z.string().email().min(1).max(255),
	password: z.string().min(6).max(255),
	userAgent: z.string().optional(),
});

//passwordReset schema
const resetPasswordSchema = z.object({ password: z.string().min(6).max(255), verificationCode: z.string().min(1).max(24) });

//body validations
const validteUser = (data) => registerSchema.parse(data);
const validteLoginUser = (data) => loginSchema.parse(data);

//create user
const createAccount = async (data) => {
	const user = await UserModel.findOne({ email: data.email });
	if (!rm._.isEmpty(user)) throw new Error('User already exists');

	//create user
	const newUser = await UserModel.create({ email: data.email, password: data.password });
	const userId = newUser._id;

	//create verification
	const verificationCode = await VerificationModel.create({ userId, type: rm.enums.VerificationType.EMAILVERIFICATION });

	// send verification email

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
	if (rm._.isEmpty(user)) throw new Error('Invalid email or password');

	const isValid = await user.comparePassword(data.password);
	if (!isValid) throw new Error('Invalid email or password');

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

const logoutUser = async (req, res) => {
	const accessToken = req.cookies.accessToken;

	const payload = rm.jwt.verify(accessToken, rm.config.jwt.secret);

	// clear session
	if (payload.sessionId) await SessionModel.deleteOne({ _id: payload.sessionId });
};

module.exports = { validteUser, validteLoginUser, createAccount, loginUser, logoutUser, setAuthCookies, clearAuthCookies };
