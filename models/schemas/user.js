const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const validator = require('email-validator');

var userSchema = new Schema({
        firstName: {type: String, trim: true},
        lastName: {type: String, trim: true},
        address: String,
        email: {type: String, trim: true, required: true, unique: true, sparse: true},
        hash: String,
        isVerified: Boolean,
        isAdmin: Boolean,
        token: String,
        purchases: [{
            name: String,
            itemId: {type: Schema.ObjectId, ref: 'Item', required: true},
            price: Number,
            quantity: Number,
            purchasedDate: Date,
            isPaid: {type: Boolean, default: false},
            deliveredDate: Date,
        }],
    },
    {
        toObject: {getters: true},
        timestamps: {
            createdAt: 'createdDate',
            updatedAt: 'updatedDate'
        }
    }
);

userSchema.pre('save', function(next) {
    if (!validator.validate(this.email) || 
            !/^.+@(.+\.)?harvard.edu/.test(this.email))
        return next(new Error('Invalid email'));
    if (this.isModified('hash'))
        this.hash = bcrypt.hashSync(this.hash);

    next();
});


userSchema.methods.comparePassword = function(pw, callback) {
    bcrypt.compare(pw, this.hash, (err, isMatch) => {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};


var User = mongoose.model('User', userSchema);

module.exports = User;
