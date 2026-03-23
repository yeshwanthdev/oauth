/**
 * This module will help for manipulating response to be sent to client end
 */

const rm = require('@root/rm');

class ResponseService {
	constructor(req, res) {
		this.req = req;
		this.res = res;
	}

	success(params) {
		try {
			const output = { success: true, data: params.data, message: params?.message || null };

			output.requestId = this.req.requestId;

			return this.res.status(200).send(output);
		} catch (error) {
			this.serverError(error);
		}
	}

	failure(error) {
		try {
			const output = { success: false, message: error?.message || 'Bad Request' };
			output.requestId = this.req.requestId;

			return this.res.status(400).send(output);
		} catch (error) {
			this.serverError(error);
		}
	}

	validationError(error) {
		try {
			const err = rm._.pick(error.error, ['name', 'details']);
			return this.res.status(400).send({ success: false, error: err });
		} catch (error) {
			this.serverError(error);
		}
	}

	serverError(error) {
		try {
			const output = { success: false, message: error?.message || 'Internal Server Error' };

			output.requestId = this.req.requestId;
			output.stackTrace = error.stack;
			output.details = error.details || {};

			return this.res.status(500).send(output);
		} catch (error) {
			console.error('error', error);
		}
	}
}

module.exports = ResponseService;
