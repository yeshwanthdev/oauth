const rm = require("@root/rm");
const { z } = require("zod");
const AppError = require("@helper/app-error");

const handleZodError = (res, error) => {
    const errors = error.issues.map((err) => ({
        path: err.path.join("."),
        message: err.message,
    }));

    return res.status(rm.enums.httpStatus.BAD_REQUEST).json({
        errors,
        message: error.message,
    });
};

const handleAppError = (res, error) => {
    return res.status(error.statusCode).json({
        message: error.message,
        errorCode: error.errorCode,
    });
};

const errorHandler = (error, req, res, next) => {

    const responseService = new rm.responseService(req, res);

    if (error instanceof z.ZodError) {
        return handleZodError(res, error);
    }

    if (error instanceof AppError) {
        return handleAppError(res, error);
    }

    return responseService.serverError(error);
};

module.exports = errorHandler;
