const Tour = require("../../mongodb/models/tour");
const jwt = require('jsonwebtoken');
const User = require('../../mongodb/models/user');
const Booking = require("../../mongodb/models/booking");

// @route         GET /
// @desc          Get overview page with all tours
// @accessibility Public

exports.getOverview = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.render("pages/overview", { title: 'Overview', tours });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};
 
// @route         GET /my-bookings
// @desc          Get user's bookings
// @accessibility private

exports.getUserBookings = async (req, res) => {
  try {
    // (1) Get all tour Ids from bookings
    const tourIds= (await Booking.find({ user: req.user.id })).map(booking => booking.tour);
    
    // (2) Get all tours from the tour Ids
    const tours = await Tour.find({ _id: { $in: tourIds } });
  
    // (3) render page with all ther tours
    res.render('pages/overview.pug', { title: 'My Bookings', tours });

  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};
 
// @route         GET tour/:slug
// @desc          Get tour page by slug
// @accessibility Public

exports.getTour = async (req, res) => {

    try {
        const tour = await Tour.findOne({ slug: req.params.slug }).populate('reviews');
        if (!tour) return res.status(404).json({ status: 'fail', message: 'resource not found' });
        res.render('pages/tour', {title: `${tour.name} Tour`, tour})
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
}

// @route         GET /login
// @desc          Get login page
// @accessibility Public

exports.getLogin = (req, res) => res.render('pages/login', {title: 'Login'})

// @route         GET /my-account
// @desc          my accoutn page
// @accessibility private 

exports.getAccount = (req, res) => res.render('pages/account', {title: 'My Account'})


// @route         All Methods / All Routes (hits this route if nothing else matches)
// @desc          404 page
// @accessibility Public

exports.get404 = (req, res) => res.render('pages/error', { title: 'Not Found', msg: 'page not found' });
