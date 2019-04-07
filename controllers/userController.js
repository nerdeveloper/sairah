const mongoose = require('mongoose');
const promsify = require('es6-promisify');
const User = require('../models/User');


exports.loginForm = (req, res) => {
    res.render('login', {title: 'Log In '});
};

exports.registerForm = (req, res) => {
    res.render('register', {title: 'Register '});
};

exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'You must supply a name').notEmpty();
    req.checkBody('email', 'The Email is not Valid!').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'Password cannot be blank!').notEmpty();
    req.checkBody('password-confirm', 'Confirmed Password cannot be blank!').notEmpty();
    req.checkBody('password-confirm', 'Oops! Your Passwords don\'t match!').equals(req.body.password);

    const errors  = req.validationErrors();
    if(errors){
        req.flash('error', errors.map(err => err.msg));
        res.render('register', {title: 'Register', body: req.body, flashes: req.flash() });
        return; // stop the function from running
       
    }
    next(); // there were no errors
};

exports.register = async (req, res, next) => {
    const user = new User({ email: req.body.email, name: req.body.name});
    const register = promsify(User.register, User);
    await register(user, req.body.password);
   // res.send('it works!');
 
   next(); //pass to the authController.login

};

exports.account = (req, res) => {
    res.render('account', {title : 'Edit Your Account'});

};
exports.updateAccount = async (req, res) => {
    const updates = {
        name: req.body.name,
        //email: req.body.email,

    };
 await User.findOneAndUpdate(
        {_id: req.user._id},
        { $set: updates },
        { new: true, runValidators: true, context: 'query'}
    ).exec();
    req.flash('success', 'Your Account has been Updated! 👋');
    res.redirect('back');

}