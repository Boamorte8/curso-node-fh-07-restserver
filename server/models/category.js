const mongoose = require('mongoose');

let Schema = mongoose.Schema;


let categorySchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Needs name'],
    },
    description: {
        type: String,
        required: [true, 'Needs description'],
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
});

module.exports = mongoose.model('Category', categorySchema);
