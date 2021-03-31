const express = require('express');
const Router = express.Router({mergeParams: true});
const {getReviews, addTourReview, deleteReview, updateReivew } = require("../controllers/review");
const { auth, restrictTo, checkIfDocExists, checkID, filterSearch } = require('../middleware/global');
const Review = require('../../mongodb/models/review');
const Tour = require('../../mongodb/models/tour');
const { checkDuplicateReview } = require('../middleware/reviews');

Router.param('id', checkID);

// available to logged in users
Router.use(auth) 

Router.route('/') 
    .get(filterSearch(Review), getReviews)
    .post( restrictTo('user'), checkIfDocExists(Tour), checkDuplicateReview, addTourReview)
Router.route("/:id")
  .delete(restrictTo("user"), checkIfDocExists(Review), deleteReview)
  .patch(restrictTo("user"), checkIfDocExists(Review), updateReivew);

module.exports = Router;