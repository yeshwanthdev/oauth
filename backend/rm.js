const lodash = require('lodash');

class RM {
	get _() {
		return lodash;
	}

	get utils() {
		return require('@helper/utils');
	}

	get mongoose() {
		return require('mongoose');
	}

	get jwt() {
		return require('jsonwebtoken');
	}

	get commonSchema() {
		return require('@helper/utils').commonSchema;
	}

	get enums() {
		return require('@config/enums.json');
	}

	get responseService() {
		return require('@service/response');
	}

	get config() {
		const env = require('@config/env.js');
		const app = require('@config/app.json');
		const config = this._.merge({}, app, env);
		return config;
	}
}

module.exports = new RM();
