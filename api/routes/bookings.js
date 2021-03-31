const express = require('express');
const Booking = require('../../mongodb/models/booking');
const { getCheckoutSession, getAllBookings, getBooking, updateBooking, deleteBooking, getUserBookings } = require('../controllers/bookings');
const { auth, checkID, restrictTo, checkIfDocExists } = require('../middleware/global');
const Router = express.Router();

// authentication for below routes
Router.use(auth);

Router.get("/checkout-session/:tourID", getCheckoutSession);

// restrict below routes to admin and lead-guide
Router.use(restrictTo('admin', 'lead-guide'))

Router.get('/', getAllBookings)

// id checker for below routes
Router.param("id", checkID);

Router.get("/user/:id", getUserBookings);
Router.route('/:id')
    .get(checkIfDocExists(Booking), getBooking)
    .patch(updateBooking)
    .delete(deleteBooking)

module.exports = Router;