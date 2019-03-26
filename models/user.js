const Schema =  mongoose.Schema;
mongoose.Promise = global.Promise;
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
    }
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email'});
userSchema.plugin(mongoosedbErrorHandler);

module.exports = mongoose('User', userSchema)