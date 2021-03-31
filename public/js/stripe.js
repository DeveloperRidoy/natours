import axios from "axios";
import { showAlert } from "./alerts";

export const bookTour = async () => {
    const stripe = Stripe(
      "pk_test_51GtfuGAcBX8weQJc0jJ44dHKPyIjf8awqOmQYDjwZORqgOOHGQ6uAbo865OJCZA56JR0fwvwbtloLAktpkt2lTgm00pij2w37k"
    );
    try {
        document.getElementById('book-tour').innerHTML = 'Processing...';
        const tourID = document.getElementById('book-tour').getAttribute('data-tour-id');
        // (1) Get checkout session from the API
        const session = await (await axios.get(`http://localhost:5000/api/v1/bookings/checkout-session/${tourID}`)).data.session;

        // (2) Create checkout form and charge credit card
        const result = await stripe.redirectToCheckout({ sessionId: session.id });
        if (result.error) return showAlert('error', result.error.message);

    } catch (error) {
        showAlert('error', error.response ? error.response.data.message: error.message);
    }
}