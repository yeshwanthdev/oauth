const AppError = require("./app-error");

const assert = (httpStatusCode, message) => new AppError(httpStatusCode, message);

module.exports = assert;
