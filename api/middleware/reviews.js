const Review = require('../../mongodb/models/review');

// prevent duplicate reviews
exports.checkDuplicateReview = async (req, res, next) => {
  const duplicateReview = await Review.find({ tour: req.params.id, user: req.user.id });
  if (duplicateReview.length > 0)
    return res
      .status(400)
      .json({
        status: "fail",
        message: `multiple reviews are not allowed`,
      });
  next();
};
