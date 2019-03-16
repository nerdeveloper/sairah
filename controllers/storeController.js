const mongooose  = require('mongoose');
const Store  = mongooose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');


const multerOptions = {
    storage: multer.memoryStorage(),
    filefilter(req, file, next){
        const isPhoto = file.mimetype.startWith('image/');
        if(isPhoto) {
            next(null, true);
        }else {
            next({ message: 'That filetype isn\'t allowed!'}, false);
        }
    }
};
exports.homePage = (req,res) => {
    res.render('index', {title: 'Home'});
};

exports.addStore = (req, res) => {
    res.render('editstore', {title: 'Add store'});
};

exports.upload = multer(multerOptions).single('photo'); 

exports.resize = async(req, res, next) => {
    // check if there is no file resize
    if(!req.file) {
        next(); //skip the middleware
        return;
    }
    const extensions  = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extensions}`;
    
    //now we can resize
    const photo = await jimp.read(req.file.buffer)
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);

    //once we have written the photo to our filesystem, keep going!
    next();
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
exports.editStore = async (req, res) => {
    //Find store by ID
    const store = await Store.findOne({_id: req.params.id});
    //res.json(store)
   res.render('editStore', {title: `Edit ${store.name}`, store}) 
}

exports.updateStore = async (req, res) => {
    //Set the location data to be a point]
    req.body.location.type = 'Point';
    // Find and update the store
    const store = await Store.findOneAndUpdate({ _id: req.params.id}, req.body, {
        new: true,// return the new store instead of the old one
        runValidators: true
    }).exec();
    req.flash(`success`, `Sucessfully updated <strong>${store.name}</strong>. 
    <a href="/stores/${store.slug}">View more </a>`);
    res.redirect(`/stores/${store._id}/edit`)

    //Redirect them to the store and tell them it worked

}