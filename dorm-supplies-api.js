const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

const config = require('./models/config');

var app = express();

if (app.get('env') !== 'production') app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


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
        res.status(err.status || 500).send();
    });

app.use((err, req, res, next) => {
    res.status(err.status || 500).send();
});

var server = app.listen(config.port);
console.log('Listening at http://localhost:%s in %s mode',
    server.address().port, app.get('env'));

module.exports = app;
