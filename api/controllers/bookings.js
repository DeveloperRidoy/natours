const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Booking = require('../../mongodb/models/booking');
const Tour = require("../../mongodb/models/tour");
const { getAllDocs, getDoc, updateOneDoc, deleteOneDoc } = require('./handlerFactory');


// @route           GET /api/vi/bookings/
// @desc            Get all bookings
// @accessibility   Private

exports.getAllBookings = getAllDocs(Booking);

 
// @route         GET /api/v1/bookings/user/:id
// @desc          Get user's bookings
// @accessibility private

exports.getUserBookings = async (req, res) => {
  try {
    // (1) Get all tour Ids from bookings
    const bookings= await Booking.find({ user: req.params.id })
  
    // (3) render page with all ther tours
      res.json({
          status: 'success',
          results: bookings.length,
          data: { bookings }
      })

  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// @route           GET /api/vi/bookings/:id
// @desc            Get all bookings
// @accessibility   Private

exports.getBooking = getDoc(Booking);

// @route         patch api/v1/bookings/:id
// @desc          update a booking
// @accessibility private

exports.updateBooking = updateOneDoc(Booking);

// @route         DELETE api/v1/bookings/:id
// @desc          Delete a booking
// @accessibility private

exports.deleteBooking = deleteOneDoc(Booking);

// @route           GET /api/vi/bookings/checkout-session/:tourID
// @desc            Get checkout session
// @accessibility   Private

exports.getCheckoutSession = async (req, res) => {
    try {
    // (1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourID);
    if (!tour) return res.status(404).json({ status: 'fail', message: 'Tour not found' });

    // (2) Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${tour.id}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    })

    // (3) Send the response to the client
    res.json({
        status: 'success',
        session
    })
    } catch (error) {
        console.log(error);
        res.status('500').json({ status: 'fail', message: error.message });
    }
}


// @route           GET /?tour=x&user=x&price=x
// @desc            Add a booking
// @accessibility   Private

exports.createBookingCheckout = async (req, res, next) => {
    try {
        // temporary insecure solution...everyone can make booking without paying
        // (1) extract info from query
        const { tour, user, price } = req.query;

        // (2) check if query is for checkout
        if (!tour && !user && !price) return next();
 
        // (3) add a booking
        await Booking.create({ tour, user, price });
        
        // (4) ret rid of the query 
        res.redirect(req.originalUrl.split('?')[0]);
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
}