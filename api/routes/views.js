const express = require('express');
const Router = express.Router();
const { getOverview, getTour, getLogin, get404, getAccount, getUserBookings } = require('../controllers/views');
const { isLoggedIn, userAuth } = require('../middleware/views');


Router.use(isLoggedIn);
Router.get('/', getOverview);
Router.get('/login', getLogin)
Router.get('/tour/:slug', getTour);
Router.get('/me', userAuth, getAccount);
Router.get('/my-bookings', userAuth, getUserBookings )
Router.all(/^(?!\/api\/)/, get404);  //handle every 404 pages except for the api
module.exports = Router;