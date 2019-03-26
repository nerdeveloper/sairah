const express = require('express');
const router = express.Router();
const storeController  = require('../controllers/storeController')
const userController = require('../controllers/userController');
const { catchErrors } =  require('../handlers/errorHandlers')

// Do work here
router.get('/', storeController.getStores);
router.get('/stores', storeController.getStores);

router.get('/add', storeController.addStore);

router.post('/add',  
storeController.upload,
catchErrors(storeController.resize),
catchErrors(storeController.createStore));

router.post('/add/:id',  
storeController.upload,
catchErrors(storeController.resize),
catchErrors(storeController.updateStore));

router.get('/stores/:id/edit', catchErrors(storeController.editStore));

router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/login', userController.loginForm);
router.get('/register', userController.registerForm);

// 1. Validate the registration Data
// 2. Register the userController
// 3. We need to log them in

router.post('/register', userController.validateRegister)


module.exports = router;
