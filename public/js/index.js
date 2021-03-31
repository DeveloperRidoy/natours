import '@babel/polyfill';
import { login } from './login';
import { logout } from './logout';
import { showMap } from './mapbox';
import { bookTour } from './stripe';
import { updateUserData, updateUserPassword } from './updateSettings';

// dom elements
const loginForm = document.getElementById("login-form");
const mapBox = document.getElementById("map");
const logoutButton = document.getElementById("logout");
const userDataForm = document.querySelector(".form-user-data");
const userPasswordForm = document.querySelector(".form-user-password");
const bookTourButton = document.getElementById('book-tour');

// login
loginForm && loginForm.addEventListener("submit", async (e) => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    e.preventDefault();
    await login(email, password);
});

// show map
mapBox && showMap();

// logout
logoutButton && logoutButton.addEventListener('click', logout);

// update user data
userDataForm &&  userDataForm.addEventListener('submit', updateUserData);

// update user password
userPasswordForm && userPasswordForm.addEventListener('submit', updateUserPassword);

// book tour via stripe
bookTourButton && bookTourButton.addEventListener('click', bookTour);