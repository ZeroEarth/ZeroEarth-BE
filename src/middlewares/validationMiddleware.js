const { sendErrorResponse } = require('../utils/common');

const joiValidationMiddleware = (schema, isParam = false) => {
    return (req, res, next) => {
        const { error } = schema.validate(isParam ? req.params :req.body);
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            const errors = new Error(errorMessage);
            errors.statusCode = 400;
            return sendErrorResponse(res, errors, errorMessage);
        }
        next();
    };
};

module.exports = joiValidationMiddleware