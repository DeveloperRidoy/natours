const Booking = require("../../mongodb/models/booking");
const User = require("../../mongodb/models/user");

exports.createBookingCheckout = async (session) => {
    try {
        console.log(session);
        const tour = session.client_reference_id;
        const user = (await User.find({ email: session.customer_details.email })).id;
        const price = session.amount_total / 100;
        await Booking.create({ tour, user, price });
    } catch (error) {
        new Error(error.message);
    }
}
    