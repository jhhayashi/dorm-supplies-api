const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var itemSchema = new Schema({
        name: {type: String, required: true, trim: true},
        price: {type: Number, required: true},
        img: String,
        description: String,
        inventory: Number,
    },
    {
        toObject: {getters: true},
        timestamps: {
            createdAt: 'createdDate',
            updatedAt: 'updatedDate'
        }
    }
);

var Item = mongoose.model('Item', itemSchema);

module.exports = Item;
