const Item = require('../models/schemas/item');
const User = require('../models/schemas/user');
const config = require('../models/config');

exports.getAllItems = (req, res, next) => {
    Item.find({}, (err, items) => {
        if (err) return next(err);
        res.json(items);
    });
};

exports.getItemById = (req, res, next) => {
    Item.findById(req.params.id, (err, item) => {
        if (err) return next(err);
        if (!item) return res.status(404).send('No item with that ID');
        res.json(item);
    });
};

// TODO validation
// promise example!
exports.createItem = (req, res, next) => {
    var newItem = new Item(req.body);
    newItem.save()
    .then((ret) => res.sendStatus(200))
    .catch((err) => next(err));
};

exports.updateItemById = (req, res, next) => {
    Item.findByIdAndUpdate(req.params.id, req.body, (err, doc) => {
        if (err) return next(err);
        if (!doc) return res.status(404).send('No item with that ID');
        res.sendStatus(200);
    });
};

exports.deleteItem = (req, res, next) => {
    Item.findByIdAndRemove(req.params.id, (err) => {
        if (err) return next(err);
        res.sendStatus(200);
    });
};

// TODO auth
exports.purchaseItem = (req, res, next) => {
    if (!req.body.userId) return res.status(403).send('Account required');
    var quantity = req.body.quantity || 1;
    Promise.all([
        User.findById(req.body.userId).exec(),
        Item.findById(req.params.id).exec()
    ]).then((results) => {
        var user = results[0];
        var item = results[1];
        if (!item) return res.status(404).send('No item with that ID');
        if (!user) return res.status(401).send('Token user ID invalid');

        if (typeof item.inventory === 'number' && item.inventory < quantity) {
            var err = new Error('Insufficient inventory');
            err.status = 400;
            throw err;
        }

        // add purchase to user account
        user.purchases.push({
            name: item.name,
            itemId: item.id,
            price: item.price,
            quantity: quantity,
            purchasedDate: new Date()
        });
        user.markModified('purchases');
        var userPromise = user.save();
        userPromise.then((user) => {
            // TODO confirmation email

            if (typeof item.inventory !== 'number') return;
            item.inventory -= quantity;
            // TODO send email for low inventory
            return item.save();
        });
    }).then(() => {
        res.sendStatus(200)
    }).catch((err) => next(err));
};
