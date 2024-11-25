const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const axios = require('axios');

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

const googleLogin = async (req, res) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = new User({
        email: payload.email,
        name: payload.name,
        googleId: payload.sub
      });
      await user.save();
    }
    
    const token = user.generateJwt();
    res.status(200).json({token});
  } catch (err) {
    res.status(401).json({message: 'Google authentication failed'});
  }
};

// Add Google OAuth callback handler
const googleCallback = async (req, res) => {
  try {
    const { code } = req.body;
    
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: 'http://localhost:4200/auth/callback',
      grant_type: 'authorization_code'
    });

    // Get user info with access token
    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
    });

    // Find or create user
    let user = await User.findOne({ email: userInfo.data.email });
    if (!user) {
      user = new User({
        email: userInfo.data.email,
        name: userInfo.data.name,
        googleId: userInfo.data.sub
      });
      await user.save();
    }

    // Generate JWT
    const token = user.generateJwt();
    res.status(200).json({ token });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  googleCallback
};