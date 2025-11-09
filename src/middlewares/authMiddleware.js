
// const { sendErrorResponse } = require('../utils/common');


// const authenticate = (req, res, next) => {
//   passport.authenticate("jwt", { session: false }, (err, user, info) => {
//     if (err) return next(err);
//     if (!user) {
//         const error = new Error("Unauthorized");
//         error.statusCode = 400;
//         return sendErrorResponse(res, error, "Unauthorized");
//     } 

//     req.user = user;
//     next();
//   })(req, res, next);
// };

// module.exports = authenticate;



const jwt = require('jsonwebtoken');

const { sendErrorResponse } = require('../utils/common');
const { JWT_SECRET } = require("../config/serverConfig");
const { AuthRepository } = require("../repositories");

const authRepo = new AuthRepository();

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Authorization header missing or invalid');
    error.statusCode = 401;
    return sendErrorResponse(res, error, 'Unauthorized');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await authRepo.findUserById(decoded.auth_id);
    if (!user) {
      const error = new Error('User not found or deleted');
      error.statusCode = 401;
      return sendErrorResponse(res, error, 'Unauthorized');
    }

    req.user = {
      ...decoded,
    };

    next();
  } catch (err) {
    const error = new Error('Invalid or expired token');
    error.statusCode = 401;
    return sendErrorResponse(res, error, 'Unauthorized');
  }
};

module.exports = authenticate;


