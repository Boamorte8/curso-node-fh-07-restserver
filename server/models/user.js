const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let rolesValid = {
    values: ['USER', 'ADMIN', 'VISITOR'],
    message: '{VALUE} is not valid'
};

let Schema = mongoose.Schema;

// validators
// String
// lowercase: boolean, whether to always call .toLowerCase() on the value
// uppercase: boolean, whether to always call .toUpperCase() on the value
// trim: boolean, whether to always call .trim() on the value
// match: RegExp, creates a validator that checks if the value matches the given regular expression
// enum: Array, creates a validator that checks if the value is in the given array.
// minlength: Number, creates a validator that checks if the value length is not less than the given number
// maxlength: Number, creates a validator that checks if the value length is not greater than the given number

// numbers
// min: Number, creates a validator that checks if the value is greater than or equal to the given minimum.
// max: Number, creates a validator that checks if the value is less than or equal to the given maximum.

// date
// min: Date
// max: Date

let userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Needs full name'], // can be a function
            trim: true
        },
        email: {
            type: String,
            lowercase: true,
            unique: true,
            index: true,
            trim: true,
            required: [true, 'Needs email']
        },
        password: {
            type: String,
            required: [true, 'Needs password'],
        },
        img: {
            type: String,
            required: false,
        },
        role: {
            type: String,
            enum: rolesValid,
            default: 'USER'
        },
        state: {
            type: Boolean,
            default: true,
        },
        google: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre(['save'], function capitalizeFields (next) {
    this.name = capitalize(this.name);
    next();
});

userSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
};

userSchema.plugin( uniqueValidator, {
    message: '{PATH} must be unique'
} );

function capitalize (name) {
    return name.replace(/\b(\w)/g, s => s.toUpperCase());
}

module.exports = mongoose.model('User', userSchema);