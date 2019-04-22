/* eslint-disable consistent-return */
/* eslint-disable func-names */
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const slug = require('slugs');
// const slug = require('url-slug');

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: 'Please enter a Store name',
    },
    slug: String,
    description: {
      type: String,
      trim: true,
      required: 'Please enter a description for your Store.',
    },
    tags: [String],
    created: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: {
        type: String,
        default: 'Point',
      },
      coordinates: [
        {
          type: Number,
          required: 'You must supply coordinates!',
        },
      ],
      address: {
        type: 'String',
        required: 'You must supply an address!',
      },
    },
    photo: String,
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: 'You must supply an author',
    },
  },
  {
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  },
);
// Define our Index
storeSchema.index({
  name: 'text',
  description: 'text',
});

storeSchema.index({location: '2dsphere'});

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    return next(); // skip
  }
  this.slug = slug(this.name);
  // find other stores that have a slug of wes, wes-1, wes-2
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storeWithSlug = await this.constructor.find({slug: slugRegEx});

  if (storeWithSlug.length) {
    this.slug = `${this.slug}-${storeWithSlug.length + 1}`;
  }
  next();
  // @TODO make more resilient so slugs are unique
});

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    {$unwind: '$tags'},
    {$group: {_id: '$tags', count: {$sum: 1}}},
    {$sort: {count: -1}},
  ]);
};

storeSchema.statics.getTopStores = function() {
  return this.aggregate([
    // Lookup Stores and populate their reviews
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'store',
        as: 'reviews',
      },
    },
    // filter for only items that have 2 or more reviews

    {$match: {'reviews.1': {$exists: true}}},
    // Add the average review field
    {
      $addFields: {
        averageRating: {$avg: '$reviews.rating'},
      },
    },
    // sort it by our field, highest review first
    {$sort: {averageRating: -1}},
    // limit to at most 10
    {$limit: 10},
  ]);
};
// find reviews where the stores _id property === reviews store property
storeSchema.virtual('reviews', {
  ref: 'Review', // what model to link?
  localField: '_id', // which field on the store?
  foreignField: 'store', // which field on the review?
});
function autopopulate(next) {
  this.populate('reviews');
  next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema);
