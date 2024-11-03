const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('users');
const register = async (req, res) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res
        .status(400)
        .json({"message": "All fields required"});
    }
  
    const user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.setPassword(req.body.password);
    
    try {
      await user.save();
      const token = user.generateJwt();
      res
        .status(200)
        .json({token});
    } catch (err) {
      res
        .status(400)
        .json(err);
    }
  };
  const login = async (req, res) => {
    console.log('Login endpoint hit'); // Add this for debugging
    if (!req.body.email || !req.body.password) {
        return res
            .status(400)
            .json({"message": "All fields required"});
    }

    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res
                .status(401)
                .json({"message": "Incorrect email or password"});
        }
        if (!user.validPassword(req.body.password)) {
            return res
                .status(401)
                .json({"message": "Incorrect email or password"});
        }
        const token = user.generateJwt();
        res
            .status(200)
            .json({token});
    } catch (err) {
        console.error('Login error:', err); // Add this for debugging
        res
            .status(400)
            .json(err);
    }
};

module.exports = {
register,
login
};