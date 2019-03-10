const mongoose = require('mongoose');
mongoose.Promise = global.Promise
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: "Please enter a Store name"
    },
    slugs: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String]
});

storeSchema.pre('save', (next) => {
    if(!this.isModified('name')){
        return next(); // skip
        
    }
})