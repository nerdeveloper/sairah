const express = require('express');

const Recaptcha = require('express-recaptcha').RecaptchaV3;
// import Recaptcha from 'express-recaptcha'
const recaptcha = new Recaptcha(process.env.SITE_KEY, process.env.SECRET_KEY);

const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const {catchErrors} = require('../handlers/errorHandlers');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

// Do work here
router.get('/', storeController.getStores);
router.get('/stores', storeController.getStores);
router.get('/stores/page/:page', storeController.getStores);

router.get('/add', authController.isLoggedIn, storeController.addStore);

router.post(
  '/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore),
);

router.post(
  '/add/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore),
);

router.get('/stores/:id/edit', catchErrors(storeController.editStore));

router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/login', recaptcha.middleware.render, userController.loginForm);
router.post('/login', authController.login);
router.get('/register', userController.registerForm);

// 1. Validate the registration Data
// 2. Register the userController
// 3. We need to log them in

router.post(
  '/register',
  userController.validateRegister,
  catchErrors(userController.register),
  authController.login,
);

router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, userController.account);

router.post('/account', catchErrors(userController.updateAccount));

router.post('/account/forgot', catchErrors(authController.forgot));

router.get('/account/reset/:token', catchErrors(authController.reset));

router.post(
  '/account/reset/:token',
  authController.confirmedPassword,
  catchErrors(authController.update),
);

router.get('/map', storeController.mapPage);
router.get(
  '/hearts',
  authController.isLoggedIn,
  catchErrors(storeController.getHearts),
);
router.post(
  '/reviews/:id',
  authController.isLoggedIn,
  catchErrors(reviewController.addReview),
);
router.get('/top', catchErrors(storeController.getTopStores));

/*
    API
*/

router.get('/api/search', catchErrors(storeController.searchStores));
router.get('/api/stores/near', catchErrors(storeController.mapStores));
router.post('/api/stores/:id/heart', catchErrors(storeController.heartStore));

module.exports = router;
