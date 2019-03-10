const express = require('express');
const router = express.Router();

// Do work here
router.get('/', (req, res) => {
  res.send('Hey! It works!');
});

router.get('/add', (req, res) => {
  res.render('editstore', {title: 'Add store'});
});

module.exports = router;
