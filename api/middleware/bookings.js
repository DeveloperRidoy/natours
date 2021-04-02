const Booking = require("../../mongodb/models/booking");
const User = require("../../mongodb/models/user");

exports.createBookingCheckout = async (session, res) => {
    try {
        const tour = session.client_reference_id;
        const user = (await User.findOne({ email: session.customer_email })).id;
        const price = session.display_items[0].amount / 100;
        await Booking.create({ tour, user, price });
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: `webhook error: ${error.message}`});
    }
}