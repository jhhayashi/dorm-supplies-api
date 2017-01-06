const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchema = new Schema({
        firstName: {type: String, trim: true},
        lastName: {type: String, trim: true},
        venmo: {type: String, required: true},
        email: {type: String, trim: true, required: true, unique: true, sparse: true},
        address: {type: String, required: true},
        phone: String,
        hash: String,

        // stuff i didn't use in my solution
        classYear: Number,
        tags: [String],
        timeSpent: Number,
        cart: [Schema.ObjectId],


        isVerified: Boolean,
        isAdmin: Boolean,
        token: String,
        purchases: [{
            name: String,
            id: {type: Schema.ObjectId, ref: 'Item', required: true},
            price: Number,
            number: Number,
            purchaseDate: Date,
            deliveryDate: Date,
            deliveredBy: Schema.ObjectId,
            paidDate: Date,
            refundedDate: Date
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

var User = mongoose.model('User', userSchema);

module.exports = User;
