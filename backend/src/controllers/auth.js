const rm = require('@root/rm');
const authWrapper = require('@wrapper/auth');

const register = async (req, res) => {
	const response = new rm.responseService(req, res);

	//validate request
	const request = authWrapper.validteUser({ ...req.body, userAgent: String(req.headers['user-agent']) });

	//create account
	const { user, accessToken, refreshToken } = await authWrapper.createAccount(request);

	//set Auth Cookies
	authWrapper.setAuthCookies(res, accessToken, refreshToken);

	return response.success({ message: 'User registered successfully', data: user });
};

const login = (req, res) => {};

module.exports = { register };
