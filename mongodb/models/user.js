const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Tour = require('./tour');


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please provide your username"],
  },
  email: {
    type: String,
    required: [true, "please provide your email address"],
    unique: true,
    lowercase: true,
    validate: {
      validator: (val) => {
        const properFormat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return properFormat.test(val);
      },
      message: "{VALUE} is not a valid email address",
    },
  },
  password: {
    type: String,
    required: [true, "please provide a password"],
    minLength: [6, "Password must be six characters long"],
    maxLength: [18, "Password must not be more than eighteen characters"],
    select: false
  },
  confirmPassword: {
    type: String,
    required: [true, "please confirm your password"],
    validate: {//this only works when creating a document
        validator: function (val) { return val === this.password },
        message: "Passwords do not match",
    },
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now(),
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'guide', 'lead-guide', 'admin'],
      message: 'user-role must be one of user, guide, lead-guide, admin'
    },
    default: 'user'
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
}
);

// remove inactive user from every query
userSchema.pre(/^find/, function (next) {
  this.find({ active: true  });
  next();
})

// runs after mongoose authentication and before saving the doc
userSchema.pre('save', async function (next) {
  // jump to next middleware if document is new or password was not modified
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
  this.passwordChangedAt = Date.now() - 1000; //minus 1 second to make up for the delay of processing the request
  next()
})

// method for creating password reset token...this refers to the current document
userSchema.methods.cretePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('user', userSchema);

module.exports = User;