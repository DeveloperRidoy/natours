import '@babel/polyfill';
import { showAlert } from './alerts';
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

// attributes
const alert = document.body.getAttribute('alert');

// login
loginForm && loginForm.addEventListener("submit", login);

// logout
logoutButton && logoutButton.addEventListener('click', logout);

// show map
mapBox && showMap();

// update user data
userDataForm &&  userDataForm.addEventListener('submit', updateUserData);

// update user password
userPasswordForm && userPasswordForm.addEventListener('submit', updateUserPassword);

// book tour via stripe
bookTourButton && bookTourButton.addEventListener('click', bookTour);

// show alert if there is alert in the body
alert && showAlert('success', alert);