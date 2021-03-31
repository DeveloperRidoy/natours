const User = require('../../mongodb/models/user');
const bcrypt = require('bcryptjs');
const Email = require('../../utils/email');
const crypto = require('crypto');
const jwtCookieToken = require('../../utils/jwtCookieToken');

// @route          api/v1/users/signup
// @desc           user signup
// @accessibility  public

exports.signUp = async (req, res) => {
  try {
    const user = await User.create(req.body);

    const token = jwtCookieToken(user, res);
      
    // send welcome email 
    const url = `${req.protocol}://${req.get('Host')}/me`;
    await new Email(user, url ).sendWelcome();
   
    // send response
    res.json({
        status: 'success',
        token,
        data: {user},
    })
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
}

// @route          api/v1/users/login
// @desc           user login
// @accessibility  public 

exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;

      // check if email and password is provided
      if (!email || !password) return res.status(400).json({ status: 'fail', message: 'please provide both email and password to login' });

      // check if user exists
      const user = await User.findOne({ email }).select('+password');
      if (!user) return res.status(403).json({ status: 'fail', message: 'invalid credentials' });

      // check if password is correct
      const passwordConfirmed = await  bcrypt.compare(password, user.password);
      if (!passwordConfirmed) return res.status(403).json({ status: 'fail', message: 'invalid credentials' });

      // return json web token on successfull login
      const token = jwtCookieToken(user, res);

      // remove password before sending user data
      user.password = undefined;
      res.json({ status: 'success', token, data: {user} });

    } catch (error) {
        console.log(error);
        res.status(500).json({status: 'fail', message: error.message})
    }
}

// @route          api/v1/users/logout
// @desc           user login
// @accessibility  public 

exports.logout = (req, res) => {
  // (1) alter user-auth-token to log out
  res.cookie("user-auth-token", "logged out", {
    expires: new Date(Date.now() + 10 * 1000),
    secure: process.env.NODE_ENV === "production" ? true : false,
    httpOnly: true,
  });

  // (2) send json response
  res.json({
    status: 'success',
    message: 'logged out'
  })
}

// @route          api/v1/users/forgot-password
// @desc           forgot password
// @accessibility  private

exports.forgotPassword = async (req, res) => {
    try {
      // 1) check if email was provided
      if(!req.body.email) return res.status(400).json({ status: 'fail', message: 'Please provide email address' })

      // 2) check if user exists
      const user = await User.findOne({ email: req.body.email });
      if(!user) return res.status(404).json({ status: 'fail', message: 'There is no user with this email address' })
      
      // 3) generate a randorm reset token
      const resetToken = user.cretePasswordResetToken();
      await user.save({validateModifiedOnly: true});
      
      // 4) send reset token to user's email
      const url = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
      await new Email(user, url).sendPasswordReset();
      
      // 5)send the response
      res.json({
          status: 'success',
          message: 'token sent to email'
      }) 
    } catch (error) {
      // remove resetToken and expireTime upon error
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateModifiedOnly: true });
      console.log(error);
      res.status(500).json({ status: 'fail', message: error.message });
    }
}

// @route          api/v1/users/reset-password/:token
// @desc           reset password
// @accessibility  private

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // (1) check if password and confirm password provided
    if (!password || !confirmPassword)
      return res
        .status(400)
        .json({
          status: "fail",
          message: "please provide both passwrod and confrimPassword field",
        });

    // (2) check if passwrod and confirm password match
    if (password !== confirmPassword)
      return res
        .status(400)
        .json({ status: "fail", message: "passwords do not match" });

    // (3) check if user exists with the token
    const user = await User.findOne({ passwordResetToken });
    if (!user)
      return res
        .status(400)
        .json({ status: "fail", message: "invalid token or expired" });

    // (4) check if token is expired
    const tokenExpired =
      Date.now() > user.passwordResetExpires.getTime() ? true : false;
    if (tokenExpired)
      return res
        .status(400)
        .json({
          status: "fail",
          message:
            "token expired.Please send another password reset request",
        });

    // (5) update password and save user
    user.password = password;
    user.confirmPassword = confirmPassword;
    await user.save({ validateModifiedOnly: true });
    
    // (6) send password reset confiramtion email
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(user, url, { password }).sendpasswordResetConfrim();
  
    // (7) return json response
    res.json({
      status: "success",
      message: "your new password is sent to your email!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({status: 'fail', message: error.message})
  }
}
          
// @route          api/v1/users/update-password/:id
// @desc           update password
// @accessibility  private

exports.updatePassword = async (req, res) => {
  try {
    // (1) check if all fields are provided
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) return res.status(400).json({ status: 'fail', message: 'Please provide currentPassword, newPassword and confrimPassword field' });
    
    // (2) check if new password and confirm passwords match
    if (newPassword !== confirmPassword) return res.status(400).json({ status: 'fail', message: 'Passwords do not match' });

    // (3) check if user exists with the id
    const user = await User.findById(req.user.id).select('password');
    if (!user) return res.status(404).json({ status: 'fail', message: 'No user found with this id' });

    // (4) check if password is correct
    const passwordIsCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!passwordIsCorrect) return res.status(400).json({ status: 'fail', message: 'password is incorrect.Please try again' });

    // (5) update Password and save user
    user.password = newPassword;
    user.confirmPassword = confirmPassword;
    await user.save({ validateModifiedOnly: true });

    // (6) return response with token
    const token = jwtCookieToken(user, res);
    res.json({
      status: 'success',
      message: 'PASSWORD updated successfully',
      token
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
}
