const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema =  mongoose.Schema;
const md5  = require('md5');
const validator = require('validator');
const mongoosedbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Invalid Email Address'],
        required: 'Please enter an Email Address'
    }, 
    name: {
        type: String,
        required: 'Please enter a name',
        trim: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    hearts: {
        type: mongoose.Schema.ObjectId, ref: 'Store'
    }
});
userSchema.virtual('gravatar').get(function () {
    const hash = md5(this.email);
    return `https://gravatar.com/avatar/${hash}?s=200`;

})
userSchema.plugin(passportLocalMongoose, { usernameField: 'email'});
userSchema.plugin(mongoosedbErrorHandler);

module.exports = mongoose.model('User', userSchema)
