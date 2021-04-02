const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Booking = require('../../mongodb/models/booking');
const Tour = require("../../mongodb/models/tour");
const { createBookingCheckout } = require('../middleware/bookings');
const { getAllDocs, updateOneDoc, deleteOneDoc } = require('./handlerFactory');


// @route           GET /api/vi/bookings/
// @desc            Get all bookings
// @accessibility   Private

exports.getAllBookings = getAllDocs(Booking);

 
// @route         GET /api/v1/bookings/my-bookings
// @desc          Get user's bookings
// @accessibility private

exports.getUserBookings = async (req, res) => {
  try {
    // (1) Get all tour Ids from bookings
      const bookings = await Booking.find({ user: req.user.id })
  
    // (3) render page with all ther tours
      res.json({
          status: 'success',
          results: bookings.length,
          data: { bookings }
      })

  } catch (error) {
    // console.log(error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// @route           GET /api/vi/bookings/:id
// @desc            Get all bookings
// @accessibility   Private

exports.getBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ user: req.user.id, tour: req.params.id });
        if(!booking) return res.status(404).json({status: 'fail', message: 'No booking found'})
        res.json({
            status: 'success',
            data: {booking}
        })
    } catch (error) {
        res.status(500).json({status: 'fail', message: error.message})
    }
}

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

    // (2) Prevent user from booking duplicate tour
    const duplicateTour = await Booking.findOne({ user: req.user.id, tour: req.params.tourID });
    if(duplicateTour) return res.status(403).json({ status: "fail", message: "You have already booked this tour" });
    
    // (2) Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        // success_url: `${req.protocol}://${req.get('host')}/?tour=${tour.id}&user=${req.user.id}&price=${tour.price}`,
        success_url: `${req.protocol}://${req.get('host')}/my-bookings`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
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
        // console.log(error);
        res.status('500').json({ status: 'fail', message: error.message });
    }
}

// @route           GET website/webhook-checkout
// @desc            Add a booking
// @accessibility   Private

exports.webhookCheckout = async (req, res) => {
    try {
        // (1) get the signature from req.headers
        const signature = req.headers["stripe-signature"];

        // (2) get access to the checkout session success event 
        const stripeEvent = stripe.webhooks.constructEvent(
          req.body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );

        // (3) create a booking using the session object in stripeEvent
        if (stripeEvent.type === "checkout.session.completed")
            await createBookingCheckout(stripeEvent.data.object);
    
        // (4) send confirmation response to stripe
        res.json({ status: 'success', message: 'payment received and booking successful' });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: `Webhook error: ${error.message}` });
    } 
}