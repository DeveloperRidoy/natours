const mongoose = require("mongoose");
const Tour = require('./tour');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Please provide review field"],
    },
    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      validate: {
        validator: (val) => val <= 5,
        message: "review must be an integer between 1 to 5",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: [true, "Please provide user id"],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "tour",
      required: [true, "Please provide tour id"],
    },
  }, 
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// indexing for better performance
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// static methods.. here this points to the current Model
reviewSchema.statics.calcRatingsAverage = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        ratingsQuantity: { $sum: 1 },
        ratingsAverage: { $avg: "$rating" },
      },
    },
  ]);

   await Tour.findByIdAndUpdate(
      tourId,
      {
          ratingsQuantity: stats.length > 0 ? stats[0].ratingsQuantity : 0 ,
          ratingsAverage: stats.length > 0 ? stats[0].ratingsAverage: 4.5
      },
      {
          runValidators: true,
          useFindAndModify: false
      });
};

// post save middleware...this points to the current document
reviewSchema.post("save", async (doc, next) => {
  await doc.constructor.calcRatingsAverage(doc.tour);
  next();
});

// pre find middleware
reviewSchema.pre(/^find/, async function (next) {
  this.populate({ path: "user", select: "name photo" });
  next();
});

// post findOneAndUpdate, findOneAndDelete
reviewSchema.post(/^findOneAnd/, async (doc, next) => {
  doc.constructor.calcRatingsAverage(doc.tour);
  next();
})

const Review = mongoose.model("review", reviewSchema);

module.exports = Review;
