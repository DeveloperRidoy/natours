import axios from "axios";
import { showAlert } from "./alerts";

export const logout = async () => {
  document.getElementById('logout').innerHTML = 'Logging out...'
  try {
    const res = await axios.get(`/api/v1/users/logout`);
      if (res.data.status === "success") {
        showAlert("success", "Logged out successfully!");
        setTimeout(() => {
            location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};
