const mongoose = require('mongoose');

const connectDB = () => {
  // connect database
  const db = process.env.DATABASE.replace(
    'PASSWORD',
    process.env.DATABASE_PASSWORD
  ).replace('DATABASE_NAME', process.env.DATABASE_NAME);

  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    .then(() => console.log('db connected...'))
    .catch((err) => {
      console.log(err.name, err.message); 
      process.exit(1);
    }); 
};
 
module.exports = connectDB;
        