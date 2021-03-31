import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (e) => {
    e.preventDefault();
    try {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const res = await axios.post('/api/v1/users/login', { email, password });
        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully!');
            setTimeout(() => {
                location.assign('/');
            }, 1500)
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
}