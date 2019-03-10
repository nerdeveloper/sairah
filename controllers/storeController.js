const mongooose  = require('mongoose');
const Store  = mongooose.model('Store');

exports.homePage = (req,res) => {
    res.render('index');
};

exports.addStore = (req, res) => {
    res.render('editstore', {title: 'Add store'});
};

exports.createStore = async (req, res) => {
    const store = new Store(req.body);
    await store.save();
    res.redirect('/'); 
    
};
