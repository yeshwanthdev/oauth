require('../config/module-alias')();

const express = require('express'),
	rm = require('@root/rm'),
	http = require('http'),
	dotenv = require('dotenv'),
	compression = require('compression'),
	cookieParser = require('cookie-parser'),
	{ connectDB } = require('@config/db');

dotenv.config();
const app = express();

//middlewares
app.use(cookieParser());
app.use(compression());
app.use(express.json({ limit: rm.config.requestLimit }));
app.use(require('@middleware/cors'));

//routes
app.use('/auth', require('@route/auth')); //whitelist later
app.get('/', (req, res) => res.status(200).json({ status: 'ok' }));
app.use(require('@middleware/error-handler'));


async function startServer() {
	await connectDB();

	const PORT = rm.config.PORT;
	const server = http.createServer(app);

	server.listen(PORT, () => {
		console.log('------------------------');
		console.log(`Server running on port ${PORT}`);
		console.log('------------------------');
	});
}

startServer();
