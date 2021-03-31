const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,    
      unique: true,
      required: [true, "tour must have a name"],
      trim: true,
      maxLength: [40, 'A tour name must have less or equal to 40 characters'],//doesn't work with Numbers
      minLength: [10, 'A tour name must have minimum or more than 10 characters'],// doesn't work with Numbers
      validate: {
        validator: (val) => /^[a-zA-Z ]+$/.test(val),
        message: 'the tour name {VALUE} must contain only characters'
      }
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
      max: [30, 'A tour may have duration time of max 30 days']
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
      validate: {
        validator: (val) => val <= 50,
        message: 'A tour can have max group size of 50'
      }
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'A tour must have difficulty of easy, medium or difficult'
      }
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [0, 'A tour must have a minimum rating of 0'],
      max: [5, 'A tour may have a maximum rating of 5.0'],
      set: val => Math.round(val * 10)/10
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: { 
      type: Number,
      required: [true, "tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {// this only works when creating new doc.So it doesn't work on update
        validator: function (val) {return val < this.price},
        message: 'priceDiscount of {VALUE} must be less than regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      require: [true, "A tour must have a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {//geoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: [true, 'must provide coordinates for location']
      },
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'user'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// indexing for better performance
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({startLocation: '2dsphere'})  

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7
})

tourSchema.virtual('reviews', {
  ref: 'review',
  foreignField: 'tour',
  localField: '_id'
})

// document pre middleware: runs before save() and create() and has access to next , not before update 
tourSchema.pre('save', async function (next) {
  this.slug = this.name.trim().toLowerCase().replace(/ /g, '-');
  next();
})

// // query pre middleware: runs before quering
tourSchema.pre(/^find/, function (next) {
  // hide secretTour
  this.find({ secretTour: { $ne: true } });

  // populate guides field and hide __v and passwordChangedAt
  this.populate({ path: 'guides', select: '-__v -passwordChangedAt' });
  next()
  
})   



// aggregation pre middleware: this runs before aggregation
tourSchema.pre('aggregate', function (next) {
  // this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next()
})

// // aggregation post middleware: this runs after aggregation
// tourSchema.post('aggregate', function (doc,next) {
//   console.log('running before aggregation');
//   next()
// })


const Tour = mongoose.model('tour', tourSchema);

module.exports = Tour;