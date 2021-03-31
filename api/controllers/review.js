const Review = require("../../mongodb/models/review");
const { deleteOneDoc, createNewDoc, getAllDocs, updateOneDoc } = require("./handlerFactory");

// @route           GET /api/vi/reviews
// @desc            Get all / single tour reviews
// @accessibility   Public

exports.getReviews = getAllDocs(Review)

// @route      POST api/v1/tours/:id/reviews
// @desc       Add a reveiw
// @accebility Private(user)

exports.addTourReview = createNewDoc(Review);

// @route      PATCH api/v1/tours/:id/reviews
// @desc       Update a reveiw
// @accebility Private(user)

exports.updateReivew = updateOneDoc(Review);

// @route      DELETE api/v1/reviews/:id
// @desc       Delete a reveiw
// @accebility Private(user, admin)

exports.deleteReview = deleteOneDoc(Review)
