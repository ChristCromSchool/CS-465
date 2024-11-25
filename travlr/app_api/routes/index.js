const express = require('express');
const router = express.Router();
const {expressjwt: jwt} = require('express-jwt');
const auth = jwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'payload',
    algorithms: ['HS256']
});

const tripsController = require('../controllers/trips');
const authController = require('../controllers/authentication')


router.route('/login').post(authController.login);

router.route('/register').post(authController.register);

router.route('/trips').get(tripsController.tripsList).post(auth,tripsController.tripsAddTrip);

router.route('/trips/:tripCode').get(tripsController.tripsFindByCode).put(auth,tripsController.tripsUpdateTrip);

// Add Google OAuth callback route
router.post('/auth/google/callback', authController.googleCallback);

module.exports = router;