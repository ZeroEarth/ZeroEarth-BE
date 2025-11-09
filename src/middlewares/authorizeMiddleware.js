const { sendErrorResponse } = require('../utils/common');

const authorize = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        const error = new Error('Access Forbidden');
        error.statusCode = 403;
        return sendErrorResponse(res, error, 'Access Forbidden');
    }
    next();
};

module.exports = authorize;