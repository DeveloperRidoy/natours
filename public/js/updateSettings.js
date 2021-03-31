import axios from "axios";
import { showAlert } from "./alerts";

export const updateUserData = async (e) => {
  e.preventDefault();
  document.querySelector(".btn--save-data").innerHTML = "Updating...";
  const userName = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const photo = document.getElementById("photo").files[0];

  // multipart formdata
  const data = new FormData();
  if (userName) data.append("name", userName);
  if (email) data.append('email', email);
  if (photo) data.append('photo', photo);

  try {
    const res = await axios.patch(
      "http://localhost:5000/api/v1/users/updateMe",
      data
    );
    showAlert("success", res.data.message);
    document.querySelector(".btn--save-data").innerHTML = "Save settings";
    setTimeout(() => {
      location.reload();
    }, 1500);
  } catch (error) {
    console.log(error);
    showAlert("error", error.response.message);
  }
};

export const updateUserPassword = async (e) => {
  e.preventDefault();
  document.querySelector(".btn--save-password").innerHTML = "Updating...";
  const currentPassword = document.getElementById("password-current").value;
  const newPassword = document.getElementById("password").value;
  const confirmPassword = document.getElementById("password-confirm").value;

  const data = {};
  if (currentPassword) data.currentPassword = currentPassword;
  if (newPassword) data.newPassword = newPassword;
  if (confirmPassword) data.confirmPassword = confirmPassword;

  try {
    const res = await axios.patch(
      "http://localhost:5000/api/v1/users/update-password",
      data
    );
    showAlert("success", res.data.message);
    document.querySelector(".btn--save-data").innerHTML = "Save password";
    setTimeout(() => {
      location.reload();
    }, 1500);
  } catch (error) {
    console.log(error);
    showAlert("error", error.response.data.message);
  }
};
