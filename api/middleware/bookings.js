const Booking = require("../../mongodb/models/booking");
const User = require("../../mongodb/models/user");

exports.createBookingCheckout = async (session) => {
    const tour = session.client_reference_id;
    const user = (await User.find({ email: session.customer_email })).id;
    const price = session.display_items[0].amount / 100;
    await Booking.create({ tour, user, price });
}