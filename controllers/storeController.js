const mongooose  = require('mongoose');
const Store  = mongooose.model('Store');

exports.homePage = (req,res) => {
    res.render('index', {title: 'Home'});
};

exports.addStore = (req, res) => {
    res.render('editstore', {title: 'Add store'});
};

exports.createStore = async (req, res) => {
    const store = await (new Store(req.body)).save();
    req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`)
   // res.redirect(`/store/${store.slug}`); 
    res.redirect(`/stores`); 
    
};

exports.getStores = async (req, res) => {
    //1. Query the db for the list of all stores
    const stores = await Store.find();
    res.render('store', {title: 'Stores', stores});
};
exports.editStore = async (res, req) => {
    //Find store by ID
    const store = await Store.findOne({_id: req.params.id});
    res.json(store)
   //res.render('editStore', {title: `Edit ${store.name}`, store}) 
}