const express = require('express');
const router = express.Router();
const {expressjwt: jwt} = require('express-jwt');
const auth = jwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'payload',
    algorithms: ['HS256']
});

const tripsController = require('../controllers/trips');
const authController = require('../controllers/authentication');
const cartController = require('../controllers/cart');
const stripeController = require('../controllers/stripe');

// Basic auth routes
router.route('/login')
  .post(authController.login);

router.route('/register')
  .post(authController.register);

// Trip routes - only include implemented methods
router.route('/trips')
  .get(tripsController.tripsList);
  // Add post route back when tripsAddTrip is implemented
  // .post(auth, tripsController.tripsAddTrip);

router.route('/trips/:tripCode')
  .get(tripsController.tripsFindByCode)
  .put(auth, tripsController.tripsUpdateTrip);

// Cart routes - verify handlers exist
if (cartController.getCart && cartController.addToCart) {
  router.route('/cart')
    .get(auth, cartController.getCart)
    .post(auth, cartController.addToCart);
}

// Google OAuth - verify handler exists
if (authController.googleCallback) {
  router.post('/auth/google/callback', authController.googleCallback);
}

// Add this new route
router.post('/create-checkout-session', stripeController.createCheckoutSession);

// Add these routes
router.get('/cart', auth, cartController.getCart);
router.post('/cart', auth, cartController.updateCart);

// Add new route
router.delete('/cart/item/:code', auth, cartController.removeFromCart);

module.exports = router;