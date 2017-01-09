const mongoose = require('mongoose');
const User = require('../models/schemas/user');

exports.getAllUsers = (req, res, next) => {
    User.find({}, (err, users) => {
        if (err) return next(err);
        res.json(users);
    });
};

exports.getUserById = (req, res, next) => {
    User.findById(req.params.id, (err, user) => {
        if (err) return next(err);
        if (!user) return res.status(404).send('No user with that ID');
        res.json(user);
    });
};

// TODO verification
exports.createUser = (req, res, next) => {
    if (req.body.password) req.body.hash = req.body.password;
    var newUser = new User(req.body);
    newUser.save()
    .then((result) => next())
    .catch((err) => {
        if (err.code === 11000)
            return res.status(400).send('Email already registered');
        next(err)
    });
};

// TODO verification
exports.updateUser = (req, res, next) => {
    User.findByIdAndUpdate(req.params.id, req.body, (err, doc) => {
        if (err) return next(err);
        if (!doc) return res.status(404).send('No user with that ID');
        res.sendStatus(200);
    });
};

exports.deleteUser = (req, res, next) => {
    User.findByIdAndRemove(req.params.id, (err) => {
        if (err) return next(err);
        res.sendStatus(200);
    });
};

exports.makeAdmin = (req, res, next) => {
    User.findByIdAndUpdate(req.params.id, { isAdmin: true }, (err, user) => {
        if (err) return next(err);
        if (!user) return res.status(404).send('No user with that ID');
        res.sendStatus(200);
    });
};

exports.removeAdminPrivs = (req, res, next) => {
    User.findByIdAndUpdate(req.params.id, { isAdmin: false }, (err, user) => {
        if (err) return next(err);
        if (!user) return res.status(404).send('No user with that ID');
        res.sendStatus(200);
    });
};

exports.getUndeliveredAndUnpaidPurchases = (req, res, next) => {
    // i'll let you try this one; good luck!
    return res.json([]);
};
    
exports.getPendingByUserId = (req, res, next) => {
    User.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(req.params.id) }},
        { $project: {
            email: true,
            purchases: { $filter: {
                input: '$purchases',
                as: 'p',
                cond: { $or: [
                    { $ne: ['$$p.isPaid', true] },
                    { $lt: ['$$p.deliveredDate', 1 ]} 
                ]}
            }}
        }}
    ]).exec().then((users) => res.json(users))
    .catch((err) => next(err));
};

exports.markPendingPaid = (req, res, next) => {
    User.update(
        { _id: req.params.id, 'purchases._id': req.params.subId },
        { $set: { 'purchases.$.isPaid': true } },
        (err, updated) => {
            if (err) return next(err);
            if (!updated)
                return res.status(404).send('User ID and/or purchase ID not found');
            return res.sendStatus(200);
        }
    );
};

exports.markPendingDelivered = (req, res, next) => {
    User.update(
        { _id: req.params.id, 'purchases._id': req.params.subId },
        { $set: { 'purchases.$.deliveredDate': new Date() } },
        (err, updated) => {
            if (err) return next(err);
            if (!updated)
                return res.status(404).send('User ID and/or purchase ID not found');
            return res.sendStatus(200);
        }
    );
};
