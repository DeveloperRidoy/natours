const jwt = require('jsonwebtoken');

const jwtCookieToken = (user, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE_TIME });
    
    // send token via cookie
    res.cookie(
        'user-auth-token',
        token,
        {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000),
            secure: process.env.NODE_ENV === 'production' && req.secure ? true : false,
            httpOnly: true
        }
    )
    return token;
}

module.exports = jwtCookieToken;