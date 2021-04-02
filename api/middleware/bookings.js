const Booking = require("../../mongodb/models/booking");
const User = require("../../mongodb/models/user");

exports.createBookingCheckout = async (stripeEvent) => {
    try {
        const eventType = stripeEvent.type;
        const session = stripeEvent.data.object;
        if (eventType === "checkout.session.completed") {
          const tour = session.client_reference_id;
          const user = (await User.find({ email: session.customer_email })).id;
          const price = session.display_items[0].amount / 100;
          await Booking.create({ tour, user, price });
        }
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
}
    