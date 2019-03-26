const mongoose = require('mongoose');


exports.loginForm = (req, res) => {
    res.render('login', {title: 'Log In '});
}