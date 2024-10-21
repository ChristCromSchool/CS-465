const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const register = async (req, res) => {
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({ "message": "All fields required" });
  }

  const user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.setPassword(req.body.password);

  try {
    // Use async/await to handle the save operation
    await user.save();
    const token = user.generateJwt();
    res.status(200).json({ token });
  } catch (err) {
    console.log("Error saving user:", err);
    res.status(400).json(err);
  }
};



const login = (req, res) => {
  console.log("Login route hit");  // Log to confirm the request reaches here

  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ "message": "All fields required" });
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.log("Error in authentication:", err);
      return res.status(404).json(err);
    }

    if (user) {
      console.log("User authenticated, generating token");
      const token = user.generateJwt();
      res.status(200).json({ token });
    } else {
      console.log("Authentication failed, info:", info);
      res.status(401).json(info);
    }
  })(req, res);
};


module.exports = {
  register,
  login
};
