const passport = require('passport');
const mongoose = require('mongoose');
const cryptos = require('crypto');
const promisify = require('es6-promisify');
const User = require('../models/User');
const mail = require('../handlers/mail');

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

exports.isLoggedIn = (req, res, next) => {
  // check if the user is authenticated
  if (req.isAuthenticated()) {
    next(); // carry on to the login
    return;
  }

  req.flash('error', 'Oops, you must be logged in to do that!');
  res.redirect('/login');
};
exports.forgot = async (req, res) => {
  // 1. see if the a user with that email exists
  const user = await User.findOne({email: req.body.email});
  if (!user) {
    req.flash('error', 'No account with that email exists');
    return res.redirect('/login');
  }
  // 2. Set reset token and expirt on their account
  user.resetPasswordToken = cryptos.randomBytes(30).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
  await user.save();

  // 3. Send them an email with the token
  const resetUrl = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  await mail.send({
    user,
    filename: 'password-reset',
    subject: 'Password Reset',
    resetUrl,
  });
  req.flash('success', `You have been emailed a passowrd reset link.`);
  // 4. Redirect them to login
  res.redirect('/login');
};

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {$gt: Date.now()},
  });
  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  // if there is a user, show the rest password form
  res.render('reset', {title: 'Reset your Password'});
};

exports.confirmedPassword = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    next();
    return;
  }
  req.flash('error', "Password didn't match!");
  res.redirect('back');
};

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {$gt: Date.now()},
  });

  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired!');
    return res.redirect('/login');
  }

  const setPassword = promisify(user.setPassword, user);
  console.log(user.password);
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash('success', 'Nice! Your password has been reset! You are now logged in!');
  res.redirect('/');
};
