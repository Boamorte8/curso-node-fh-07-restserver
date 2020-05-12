const jwt = require('../../utils/jwt');
const config = require('../../config/config');

/**
 * Function to verify token on headers
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const verifyToken = (req, res, next) => {
    let token = req.get('Authorization');
    jwt.verify(token, config.auth.secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Invalid token',
                }
            });
        }
        req.user = decoded.user;
        next();
    });
}

/**
 * Function to verify user has admin role
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const verifyPermission = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'Invalid operation. Your user does not have permission',
            }
        });
    }
    next();
}

module.exports = {
    verifyToken,
    verifyPermission
};
