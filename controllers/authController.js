const  passport = require('passport');

exports.login = passport.authenticate('local', {
 failureRedirect: '/login',
failureFlash: 'Incorrect Email Address or Password!',
successFlash: 'You are now logged in!',
successRedirect: '/',
})