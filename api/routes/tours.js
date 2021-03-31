const Router = require('express').Router()
const { checkID, restrictTo, checkIfDocExists } = require('../middleware/global');
const { getAllTours, getTour, createTour, updateTour, deleteTour, getTourStats, getMonthlyPlan, getToursWihtin, getDistances } = require('../controllers/tours');
const { topFiveTours } = require('../middleware/tours');
const { auth, filterSearch } = require('../middleware/global');
const reviewRouter = require('./reviews');
const Tour = require('../../mongodb/models/tour');
const { uploadTourImages, resizeTourImages } = require('../middleware/multer');


Router.param('id', checkID)

Router.use('/:id/reviews', reviewRouter);
    
Router.route('/top-5-tours')
    .get(topFiveTours, getAllTours);

Router.route('/tour-stats')
    .get(getTourStats)

Router.route('/monthly-plan/:year')
    .get(auth, restrictTo('admin', 'guide', 'lead-guide'), getMonthlyPlan)

Router.get('/tours-within/:distance/center/:latlng/unit/:unit', getToursWihtin )

Router.get('/get-distances/:latlng/unit/:unit', getDistances )

Router.route('/')
    .get(filterSearch(Tour), getAllTours) 
    .post(auth, restrictTo('admin', 'lead-guide'), createTour);

Router.route('/:id')
    .all(auth, restrictTo('admin', 'lead-guide'), checkIfDocExists(Tour))

Router.route('/:id')
    .get(getTour)
    .patch( uploadTourImages, resizeTourImages, updateTour)
    .delete( deleteTour)

module.exports = Router;