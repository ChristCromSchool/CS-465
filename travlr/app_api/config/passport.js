// Ensure the user model is loaded
require('../models/user');

const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = mongoose.model('User');  // Use 'User', matching the model name

passport.use(new LocalStrategy({
  usernameField: 'email'
},
async function(username, password, done) {
  try {
    const user = await User.findOne({ email: username }).exec();  // Use async/await
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    if (!user.validPassword(password)) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));