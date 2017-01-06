const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var itemSchema = new Schema({
        name: {type: String, required: true, trim: true},
        price: {type: Number, required: true},
        img: String,
        description: String,
        inventory: Number,

        // future functionality
        postedBy: Schema.ObjectId,
        status: Number,
        views: [Date],
        clicks: [Date],
        purchases: [Date],
        tags: [String],
    },
    {
        toObject: {getters: true},
        timestamps: {
            createdAt: 'createdDate',
            updatedAt: 'updatedDate'
        }
    }
);

itemSchema.pre('save', function(callback) {
    if (this.inventory && this.inventory < 1)
        return callback(new Error('Invalid inventory'));
    if (this.price && this.price < 1)
        return callback(new Error('Invalid price'));
    this.inventory = Math.floor(this.inventory);
});

var Item = mongoose.model('Item', itemSchema);

module.exports = Item;
