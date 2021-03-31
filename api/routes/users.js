const Router = require('express').Router();
const { checkID, restrictTo, checkIfDocExists, filterSearch } = require('../middleware/global');
const {
  getAllUsers,      
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe
} = require('../controllers/users');
const { signUp, login, forgotPassword, resetPassword, updatePassword, logout } = require('../controllers/auth');
const { auth } = require('../middleware/global');
const User = require('../../mongodb/models/user');
const { uploadUserPhoto, resizeUserPhoto } = require('../middleware/multer');

Router.param("id", checkID);
// available to all
Router.post('/signup', signUp)
Router.post('/login', login)
Router.get('/logout', logout)
Router.post('/forgot-password', forgotPassword)
Router.patch("/reset-password/:token", resetPassword);

// available to anyone logged in
Router.use(auth)
Router.delete("/deleteMe", auth, deleteMe)
Router.patch("/update-password", updatePassword);
Router.get('/me', getMe)
Router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);

// only available to admin
Router.use(restrictTo('admin'));
Router.route("/").get(filterSearch(User), getAllUsers);
Router
  .route('/:id')
  .get(checkIfDocExists(User), getUser)
  .patch(restrictTo('admin'), updateUser) 
  .delete(restrictTo('admin'), checkIfDocExists(User) , deleteUser);

module.exports = Router;
