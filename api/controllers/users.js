const User = require('../../mongodb/models/user');
const { getAllDocs, getDoc, deleteOneDoc, updateOneDoc } = require('./handlerFactory');

// @route         GET api/v1/users
// @desc          get all users
// @accessibility private

exports.getAllUsers = getAllDocs(User);

// @route         GET api/v1/users/:id
// @desc          get user by id
// @accessibility public

exports.getUser = getDoc(User);

// @route         patch api/v1/users/updateMe
// @desc          user updates his/her data
// @accessibility private

exports.updateMe = async (req, res) => {
  // check if correct format photo was provided
  if (req.multerError) return res.status(req.multerError.status).json({ status: 'fail', message: req.multerError.message });
  
  try {
    const { name, email, photo } = req.body;
    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (photo) data.photo = photo;

    const updatedUser = await User.findOneAndUpdate({ _id: req.user._id }, data, { new: true , runValidators: true, useFindAndModify: false});
    
    // return response
    return res.json({
      status: 'success',
      message: 'user updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
}

// @route         patch api/v1/users/deleteMe
// @desc          user deletes him/herself
// @accessibility private

exports.deleteMe = async (req, res) => {
  try {
    // (1) deactivate user
    await User.findByIdAndUpdate(req.user._id, { active: false }, { useFindAndModify: false });

    // (2) return response
    res.status(204).json({
      status: 'success',
      message: 'user deleted successfully'
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
}

// @route         patch api/v1/users/:id
// @desc          admin updates user's data
// @accessibility private

exports.updateUser = updateOneDoc(User);

// @route         DELETE api/v1/users/:id
// @desc          Delete a user
// @accessibility private

exports.deleteUser = deleteOneDoc(User);

// @route         GET api/v1/users/me
// @desc          Get logged in user
// @accessibility private

exports.getMe = (req, res) => {
  res.json({
    status: 'success',
    data: {user: req.user}//needs auth middleware before this middleware to get req.user
  })
}