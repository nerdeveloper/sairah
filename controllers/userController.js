const mongoose = require('mongoose');


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