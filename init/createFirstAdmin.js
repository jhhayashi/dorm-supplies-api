const mongoose = require('mongoose');
const User = require('../models/schemas/user');
const config = require('../models/config');
var disconnect = false;

// open connection if doesn't exist
if (mongoose.connection.readyState === 0) {
    console.log('opening mongoose connection...');
    mongoose.connect(config.dbUrl, {server:{socketOptions:{keepAlive:120}}});

    // close connection if running as standalone script
    disconnect = true;
}

User.find({email: config.adminEmail}, (err, admins) => {
    if (err) return console.log(err);

    if (admins.length > 0) {
        if (disconnect) {
            console.log('closing mongoose connection...');
            mongoose.connection.close();
        }
        return;
    }

    console.log(`${config.adminEmail} account not detected`);

    var newAdmin = User({
        email: config.adminEmail,
        hash: config.adminPassword,
        isAdmin: true,
    });

    newAdmin.save((err) => {
        if (disconnect) {
            console.log('closing mongoose connection...');
            mongoose.connection.close();
        }
        if (err) {
            console.log('error creating admin');
            return console.log(err);
        }
        console.log(`created admin ${config.adminEmail}`);
        return;
    });
});
