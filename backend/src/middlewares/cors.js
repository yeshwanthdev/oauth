const rm = require('@root/rm');
const cors = require('cors');

const corsMiddleware = cors({
	origin: rm.config.APP_ORIGIN,
	credentials: true,
});

module.exports = corsMiddleware;
