const mongooose  = require('mongoose');
const Store  = mongooose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const User = mongooose.model('User');


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
    req.body.author = req.user._id;
    const store = await (new Store(req.body)).save();
    req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`)
   // res.redirect(`/store/${store.slug}`); 
    res.redirect(`/stores`); 
    
};

exports.getStores = async (req, res) => {
    //1. Query the db for the list of all stores
    const stores = await Store.find();
    res.render('stores', {title: 'Stores', stores});
  
};

const confirmOwner = (req, res, store, user) => {
    if(!store.author.equals(user._id)) {
        req.flash('error', `You don't own this Store`);
        res.redirect('/stores');
    }
}
exports.editStore = async (req, res) => {
    //Find store by ID
    const store = await Store.findOne({_id: req.params.id});
    // Confirm that they are the owner of this store
    confirmOwner(req, res, store, req.user);
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
    res.redirect(`/stores/${store._id}/edit`);
    //Redirect them to the store and tell them it worked
};
    exports.getStoreBySlug = async (req, res, next) => {
        const store = await Store.findOne({ slug: req.params.slug}).populate('author reviews');
        if(!store) return next();
     res.render('store', {title: store.name, store});
    }

exports.getStoresByTag = async (req, res) => {
    const tag = req.params.tag;
    const tagQuery = tag || {$exists: true};
    const tagsPromise= await Store.getTagsList();
    const storePromise = Store.find({tags: tagQuery});
    const [tags, stores] = await Promise.all([tagsPromise, storePromise]);

  
    res.render('tag', {tags, title: 'Tags', tag, stores});
};

exports.searchStores  = async (req, res) => {
   const stores = await Store.find({
       $text: {
           $search: req.query.q
       }
   }, {
       score: { $meta: 'textScore'}
   }) 
   .sort({
       
    score: { $meta: 'textScore' }

   })
   res.json(stores);
};

exports.mapStores = async (req, res) => {
   const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
   const q = {
       location: {
           $near: {
               $geometry: {
                   type: 'Point',
                   coordinates

               },
               $maxDistance: 10000 //10Km
           }
       }
   };
    const stores = await Store.find(q).select('slug name description location').limit(10);
    res.json(stores);
};

exports.mapPage = async(req, res) => {
    res.render('map', {title: 'Map'})
}


exports.heartStore = async(req, res) => {
    const hearts = req.user.hearts.map(obj => obj.toString());
    const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
    const user  = await User
    .findByIdAndUpdate(req.user._id,
    { [operator]: { hearts: req.params.id } },
    { new : true}
    ); 
    res.json(user);
};

exports.getHearts  = async(req, res) => {
    const stores = await Store.find({
        _id: {$in: req.user.hearts}
    });
    res.render('stores', { title: 'Hearted Stores', stores});
};

exports.getTopStores = async(req, res) => {
    const stores = await Store.getTopStores();
   // res.json(stores);
   res.render('topStores', { stores, title: 'Top Stores!'});
}