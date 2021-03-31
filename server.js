const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./mongodb/connectDb');
const { rateLimit } = require('./api/middleware/global');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');
const compression = require('compression');

// initialize app
const app = express();

// pug template engine
app.set('view engine', 'pug');
app.set('views',path.join(__dirname, 'views'));

// environment variables
dotenv.config({ path: './config.env' });

// set security HTTP headers
app.use(helmet());

//limit request from same IP to 100 requests per hour  
app.use(rateLimit(10000, 1)); 

// prevent duplicate parameters
app.use(
  hpp({
    whitelist: ["duration", "ratingsAverage", "ratingsQuantity", "maxGroupSize", "difficulty", "price"],
  })
);

// connect to database 
connectDB();

// compress all text responses
app.use(compression());

// log api requests in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

// read data from the req body
app.use(express.json());

// read cookie from the req body
app.use(cookieParser());

// data sanitization against noSQL query injection
app.use(mongoSanitize());

// data sanitization against XSS
app.use(xss());

// static files directory
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/',require('./api/routes/views'));
app.use('/api/v1/tours', require('./api/routes/tours'));
app.use('/api/v1/users', require('./api/routes/users'));
app.use('/api/v1/reviews', require('./api/routes/reviews'));
app.use('/api/v1/bookings', require('./api/routes/bookings'));
app.all('*', (req, res) => res.status(404).render('pages/error', { title: 'Not Found', msg: 'Page not found' }));

// PORT  
const PORT = process.env.PORT || 5000;
 
// Start server
const server = app.listen(PORT);

// close server on unhandled rejection
process.on('unhandledRejection', (err) => { 
  console.log(err);
  console.log('unhandled rejection, φ(゜▽゜*)♪, shutting down server...');
  server.close(() => process.exit(1))
})

// handling uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(err);
  console.log("uncaught exception, φ(゜▽゜*)♪, shutting down server...");
  if(server) server.close(() => process.exit(1)); 
});


     