const rm = require('@root/rm');
const authWrapper = require('@wrapper/auth');

const register = async (req, res) => {
	const response = new rm.responseService(req, res);
	try {
		const request = authWrapper.validteUser({ ...req.body, userAgent: String(req.headers['user-agent']) });

		const { user, accessToken, refreshToken } = await authWrapper.createAccount(request);

		authWrapper.setAuthCookies(res, accessToken, refreshToken);

		return response.success({ message: 'User registered successfully', data: user });
	} catch (error) {
		return response.serverError(error);
	}
};

const login = async (req, res) => {
	const response = new rm.responseService(req, res);
	try {
		const request = authWrapper.validteLoginUser({ ...req.body, userAgent: String(req.headers['user-agent']) });

		const { user, accessToken, refreshToken } = await authWrapper.loginUser(request);

		authWrapper.setAuthCookies(res, accessToken, refreshToken);

		return response.success({ message: 'Login successful', data: user });
	} catch (error) {
		return response.serverError(error);
	}
};

const logout = async (req, res) => {
	const response = new rm.responseService(req, res);
	try {
		await authWrapper.logoutUser(req, res);
		authWrapper.clearAuthCookies(res);
		return response.success({ message: 'Logout successful', data: true });
	} catch (error) {
		return response.serverError(error);
	}
};

module.exports = { register, login, logout };
