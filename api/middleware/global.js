const jwt = require("jsonwebtoken");
const User = require("../../mongodb/models/user");
const limiter = require('express-rate-limit');


// user authentication
exports.auth = async (req, res, next) => {
    // 1) check if token is provided in the header or in the cookies
  const token = req.headers.authorization && req.headers.authorization.startsWith('Bearer')
    ? req.headers.authorization.split(" ")[1]
    : req.cookies && req.cookies["user-auth-token"] && req.cookies["user-auth-token"];

    if (!token) return res.status(401).json({ status: 'fail', message: 'Please login to get access' });
    
    try {
        // 2) check if token is valid
        const validToken = jwt.verify(token, process.env.JWT_SECRET);

        // 3) check if user still exists
        const user = await User.findById(validToken.id);
        if (!user) return res.status(401).json({ status: 'fail', message: 'the user issuing the token does not exist anymore' });
        
        // 4) check if user changed password after the token was issued
        const lastPasswordChanged = (user.passwordChangedAt).getTime() / 1000;
        const tokenIssuedAt = validToken.iat * 1;

        const tokenExpired = lastPasswordChanged > tokenIssuedAt
            ? true
            : false    
        
        if (tokenExpired) return res.status(401).json({ status: 'fail', message: 'User recently changed password.Please log in again' });
        req.user = user;
        next();
    } catch (error) {
      // console.log(error);
      if(error.message === 'invalid signature') return res.status(401).json({ status: "fail", message: 'token expired or invalid' });
      res.status(401).json({ status: 'fail', message: error.message});
    }
}          

// check if id provided in the url is valid or not
exports.checkID = (req, res, next, val, name) => {
    if (val.length !== 24)
    return res.status(400).json({ status: "fail", message: "invalid id" });
  next();
};

// restrict request to user role...note: expecting user in req to work with
exports.restrictTo = (...roles) => {
 
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next()
    } else {
       return res.status(403).json({
         status: "fail",
         message: 'You do not have permission to perform this action',
       });
    }
  }
}

exports.rateLimit = (maxRequests, timeInHour) => limiter(
  {
    max: maxRequests,
    windowMs: timeInHour * 60 * 60 * 1000,
    message: 'Too many requests from this IP.Please try again in an hour'
  })

// check if doc exists and inject in the req
exports.checkIfDocExists = (Model) => async (req, res, next) => {
  const doc = await Model.findById(req.params.id).select('-passwordChangedAt -__v').populate('reviews')

  if (!doc) return res.status(404).json({ status: "fail", message: `No ${Model.collection.name.slice(0, Model.collection.name.length - 1)} found` });

  // inject tour info in the request to use in the next middleware
  req[Model.collection.name] = doc;

  next();
};

// inject filtered query in req
exports.filterSearch = (Model) => (req, res, next) => {
    // build query
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.map((field) => delete queryObj[field]);

    // filtering
    const queryStr = JSON.stringify(queryObj).replace(
        /\b(gt|gte|lt|lte)\b/g,
        (match) => `$${match}`
    );

    let query = Model.find(JSON.parse(queryStr));
    
    // sorting
    query = req.query.sort
        ? query.sort(req.query.sort.replace(/,/g, " "))
        : query.sort("-createdAt");
    
    // handling fields
    query = req.query.fields
        ? query.select(`${req.query.fields.replace(/,/g, " ")} -__v`)
        : query.select('-__v')
        
    // pagination with limit 
    // 2 5 => 5*(2-1)
    // 3 5 => 5*(3-1)
    // 4 5 => 5*(4-1)
    // page limit => limit*(page -1)
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit)
    
    req.queryFunction = {query, page, limit};

    next();
}

// prevent duplicate docs
exports.checkDuplicateDoc = (Model, options) => async (req, res, next) => { 
    const duplicateDoc = await Model.find(options);
    if (duplicateDoc) return res.status(400).json({ status: 'fail', message: `multiple ${Model.collection.name} are not allowed` });
    next();
};