const express = require('express'); // Express app
const router = express.Router();    // Router logic
const jwt = require('jsonwebtoken'); // Enable JSON Web Tokens

// This is where we import the controllers we will route
const tripsController = require('../controllers/trips');
const authController = require('../controllers/authentication');

// Method to authenticate our JWT
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader == null) {
    console.log('Auth Header Required but NOT PRESENT!');
    return res.sendStatus(401);
  }

  let headers = authHeader.split(' ');
  if (headers.length < 2) {
    console.log('Not enough tokens in Auth Header: ' + headers.length);
    return res.sendStatus(501);
  }

  const token = headers[1];
  if (token == null) {
    console.log('Null Bearer Token');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
    if (err) {
      return res.status(401).json('Token Validation Error!');
    }
    req.auth = verified; // Set the auth param to the decoded object
    next(); // We need to continue or this will hang forever
  });
}

// Define route for our register endpoint
router
  .route('/register')
  .post(authController.register);

// Define route for our login endpoint
router
  .route('/login')
  .post(authController.login);

// Define route for our trips endpoint
router
  .route('/trips')
  .get(tripsController.tripsList) // GET Method routes tripList
  .post(authenticateJWT, tripsController.tripsAddTrip); // POST Method routes tripsAddTrip

router
  .route('/trips/:tripCode')
  .get(tripsController.tripsFindByCode)
  .put(authenticateJWT, tripsController.tripsUpdateTrip);

module.exports = router;
