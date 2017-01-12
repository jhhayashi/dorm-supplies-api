const User = require('../models/schemas/user');
const jwt = require('jwt-simple');
const config = require('../models/config');

const jwt_parameters = ['email', 'isVerified', 'isAdmin'];

exports.loginUser = (req, res, next) => {
    if (typeof req.body.email !== 'string')
        return res.status(400).send('Missing email');
    if (typeof req.body.password !== 'string')
        return res.status(400).send('Missing password');

    User.findOne({email: req.body.email}, (err, user) => {
        if (err) return next(err);
        if (!user) return res.status(400).send('No user with that email');

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (err) return next(err);
            if (!isMatch) return res.status(401).send('Incorrect password');

            var payload = { id: user._id };
            jwt_parameters.forEach((s) => payload[s] = user[s]);
            if (user.firstName) payload.firstName = user.firstName;
            if (user.lastName) payload.lastName = user.lastName;

            var token = jwt.encode(payload, config.secret);
            user.token = token;
            user.save((err) => {
                if (err) return next(err);
                res.json({token});
            });
        });
    });
};

exports.validateToken = (req, res, next) => validateToken(req, res, next);

exports.adminRequired = (req, res, next) => validateToken(req, res, next, true);

function validateToken(req, res, next, isAdminRequired) {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];

    if (!token) {
        if (isAdminRequired) return res.status(403).send('Admin token required');
        req.user = false;
        return next();
    }

    try {
        var decoded = jwt.decode(token, config.secret);
    } catch (err) {
        return res.status(403).send('Failed to authenticate token');
    }

    if (isAdminRequired && !decoded.isAdmin)
        return res.status(403).send('Admin privileges required');

    User.findById(decoded.id, (err, user) => {
        if (err) return next(err);
        if (!user) return res.status(403).send('Invalid token user ID');
        var expired = false;
        jwt_parameters.forEach((s) => {
            if (decoded[s] !== user[s]) expired = true
        });
        if (expired || token !== user.token)
            return res.status(403).send('Expired token');

        req.user = user;
        next();
    });
};
