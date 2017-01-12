const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');

const config = require('./models/config');

const users = require('./controllers/users');
const items = require('./controllers/items');
const auth = require('./controllers/auth');

mongoose.Promise = global.Promise;
mongoose.connect(config.dbUrl, {server: {socketOptions: {keepAlive: 120}}});

var app = express();
var router = express.Router();

if (app.get('env') !== 'production') app.use(logger('dev'));
// run init scripts
else require('./init/init');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

// ==================================================
// Middleware
// ==================================================

router.param('id', (req, res, next, id) => {
    if (!id.match(/^[0-9a-fA-F]{24}$/))
        return res.status(400).send('Invalid ID');
    next();
});

router.param('subId', (req, res, next, id) => {
    if (!id.match(/^[0-9a-fA-F]{24}$/))
        return res.status(400).send('Invalid second ID');
    next();
});

// ==================================================
// Routes
// ==================================================

router.route('/users')
    .get(auth.adminRequired, users.getAllUsers)
    .post(users.createUser, auth.loginUser);
router.route('/users/pending')
    .get(auth.adminRequired, users.getUndeliveredAndUnpaidPurchases);
router.route('/users/:id')
    .get(auth.validateToken, users.getUserById)
    .put(auth.validateToken, users.updateUser)
    .delete(auth.validateToken, users.deleteUser);
router.route('/users/:id/pending')
    .get(auth.adminRequired, users.getPendingByUserId);
router.route('/users/:id/pending/:subId')
    .post(auth.adminRequired, users.markPendingPaid)
    .delete(auth.adminRequired, users.markPendingDelivered);

router.route('/admins/:id')
    .post(auth.adminRequired, users.makeAdmin)
    .delete(auth.adminRequired, users.removeAdminPrivs);

router.route('/items')
    .get(items.getAllItems)
    .post(auth.adminRequired, items.createItem);
router.route('/items/:id')
    .get(items.getItemById)
    .post(auth.validateToken, items.purchaseItem)
    .put(auth.adminRequired, items.updateItemById)
    .delete(auth.adminRequired, items.deleteItem);

router.route('/auth/token')
    .post(auth.loginUser);

app.use('/', router);

// handle 404
app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// developement error handler
if (app.get('env') === 'development')
    app.use((err, req, res, next) => {
        console.log(err.message);
        var status = err.status || 500;
        if (status >= 400 && status < 500 && err.message)
            var message = err.message;
        else var message = ''
        res.status(status).send(message);
    });

app.use((err, req, res, next) => {
    var status = err.status || 500;
    if (status >= 400 && status < 500 && err.message)
        var message = err.message;
    else var message = ''
    res.status(status).send(message);
});

var server = app.listen(config.port);
console.log('Listening at http://localhost:%s in %s mode',
    server.address().port, app.get('env'));

module.exports = app;
