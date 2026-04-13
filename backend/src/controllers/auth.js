const rm = require('@root/rm');
const authWrapper = require('@wrapper/auth');
const asyncHandler = require('../helpers/async-handler');

const register = asyncHandler(async (req, res) => {
	const response = new rm.responseService(req, res);

	const payload = authWrapper.validteUser({ ...req.body, userAgent: String(req.headers['user-agent']) });
	const { user, accessToken, refreshToken } = await authWrapper.createAccount(payload);
	authWrapper.setAuthCookies(res, accessToken, refreshToken);

	return response.success({ message: 'User registered successfully', data: user });
});

const login = asyncHandler(async (req, res) => {
	const response = new rm.responseService(req, res);

	const request = authWrapper.validteLoginUser({ ...req.body, userAgent: String(req.headers['user-agent']) });
	const { user, accessToken, refreshToken } = await authWrapper.loginUser(request);
	authWrapper.setAuthCookies(res, accessToken, refreshToken);

	return response.success({ message: 'Login successful', data: user });
});

const logout = asyncHandler(async (req, res) => {
	const response = new rm.responseService(req, res);

	await authWrapper.logoutUser(res.cookies.accessToken);
	authWrapper.clearAuthCookies(res);
	return response.success({ message: 'Logout successful', data: true });
});

const verifyEmail = asyncHandler(async (req, res) => {
	const response = new rm.responseService(req, res);

	const code = authWrapper.validateVerifyEmail(req.params.code);
	await authWrapper.verifyEmail(code);

	return response.success({ message: 'Email was successfully verified' });
});

const forgotPassword = asyncHandler(async (req, res) => {
	const response = new rm.responseService(req, res);

	const email = authWrapper.validateForgotPassword(req.body.email);
	await authWrapper.forgotPassword(email);

	return response.success({ message: 'Password reset email sent' });
});


const resetPassword = asyncHandler(async (req, res) => {
	const response = new rm.responseService(req, res);

	const data = authWrapper.validateResetPassword(req.body);

	await authWrapper.resetPassword(data);

	authWrapper.clearAuthCookies(res);

	return response.success({ message: 'Password reset successful' });
});

module.exports = { register, login, logout, verifyEmail, forgotPassword, resetPassword };
