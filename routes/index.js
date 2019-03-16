const express = require('express');
const router = express.Router();
const storeController  = require('../controllers/storeController')
const { catchErrors } =  require('../handlers/errorHandlers')

// Do work here
router.get('/', storeController.getStores);
router.get('/stores', storeController.getStores);

router.get('/add', storeController.addStore);

router.post('/add',  
storeController.upload,
catchErrors(storeController.resize),
catchErrors(storeController.createStore));

router.post('/add/:id',  catchErrors(storeController.updateStore));

router.get('/stores/:id/edit', catchErrors(storeController.editStore));

module.exports = router;
