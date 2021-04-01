const jwt = require('jsonwebtoken');
const Booking = require('../../mongodb/models/booking');
const User = require('../../mongodb/models/user');

// check if user is logged in and inject it into res.locals
// goes to next middleware if any error or no user... which results in a not logged in  state
exports.isLoggedIn = async (req, res, next) => {
  // 1) check if token is provided in the header or in the cookies
  const token =
    req.headers.authorization && req.headers.authorization.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : req.cookies &&
        req.cookies["user-auth-token"] &&
        req.cookies["user-auth-token"];

    if (!token) return next();

  try {
    // 2) check if token is valid
    const validToken = jwt.verify(token, process.env.JWT_SECRET);

    // 3) check if user still exists
    const user = await User.findById(validToken.id);
      if (!user) return next();
 
    // 4) check if user changed password after the token was issued
    const lastPasswordChanged = user.passwordChangedAt.getTime() / 1000;
    const tokenIssuedAt = validToken.iat * 1;

    const tokenExpired = lastPasswordChanged > tokenIssuedAt ? true : false;

    if (tokenExpired) return next();
    
    // 5) parse user to req.locals so that pug templetes can have access to the user
    res.locals.user = user;

    // 6) parse booked tours ids to use in pug template
    const bookedTourIds = (await Booking.find({ user: user.id })).map(booking => booking.tour.id);
    res.locals.bookedTourIds = bookedTourIds;
    next();
  } catch (error) {
    next()
  }
};

// user authentication ..render error page with error message
exports.userAuth = async (req, res, next) => {
    // 1) check if token is provided in the header or in the cookies
  const token = req.headers.authorization && req.headers.authorization.startsWith('Bearer')
    ? req.headers.authorization.split(" ")[1]
    : req.cookies && req.cookies["user-auth-token"] && req.cookies["user-auth-token"];

    if (!token) return res
      .status(401)
      // .json({ status: "fail", message: "Please login to get access" })
      .render("pages/error", {
        title: "Error",
        msg: "Please login to get access"
      });
    
    try {
        // 2) check if token is valid
        const validToken = jwt.verify(token, process.env.JWT_SECRET);

        // 3) check if user still exists
        const user = await User.findById(validToken.id);
        if (!user) return res.status(401).render("pages/error", {title: "Error", msg: "The user doesn't exist anymore"});
        
        // 4) check if user changed password after the token was issued
        const lastPasswordChanged = (user.passwordChangedAt).getTime() / 1000;
        const tokenIssuedAt = validToken.iat * 1;

        const tokenExpired = lastPasswordChanged > tokenIssuedAt
            ? true
            : false    
        
        if (tokenExpired) return res
          .status(401)
          .render("pages/error", {
            title: "Error",
            msg: "User recently changed password.Please log in again",
          });
        req.user = user;
        next();
    } catch (error) {
      res.status(401).render("pages/error", {title: "Error", msg: 'Please login to get access'})
    }
}          