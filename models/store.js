const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');
//const slug = require('url-slug');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: "Please enter a Store name"
    },
    slug: String,
    description: {
        type: String,
        trim: true,
        required: "Please enter a description for youu Store." 
    },
    tags: [String]
});

storeSchema.pre('save', function (next){
    if(!this.isModified('name')){
        return next(); // skip
        
    }
    this.slug = slug(this.name);
    next();

    //@TODO make more resilient so slugs are unique
});

module.exports = mongoose.model('Store', storeSchema)