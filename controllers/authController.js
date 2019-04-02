const  passport = require('passport');

exports.login = passport.authenticate('local', {
failureRedirect: '/login',
failureFlash: 'Incorrect Email Address or Password!',
successRedirect: '/',
successFlash: 'You are now logged in!',
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out! 👋');
    res.redirect('/');
  };