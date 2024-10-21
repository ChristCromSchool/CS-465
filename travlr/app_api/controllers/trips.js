const mongoose = require('mongoose');
const Trip = require('../models/travlr'); // Register model
const Model = mongoose.model('trips');
const User = require('../models/user');

// Helper function to get the authenticated user
const getUser = (req, res, callback) => {
  if (req.payload && req.payload.email) {
    User.findOne({ email: req.payload.email })
      .exec((err, user) => {
        if (!user) {
          return res.status(404).json({
            "message": "User not found"
          });
        } else if (err) {
          console.error(err);
          return res.status(404).json(err);
        }
        callback(req, res, user);
      });
  } else {
    return res.status(400).json({
      "message": "Unauthorized request"
    });
  }
};

// GET: /trips - lists all the trips
const tripsList = async(req, res) => {
  const q = await Model
      .find({}) // No filter, return all records
      .exec();

  if(!q) {
      return res.status(404).json(err);
  } else {
      return res.status(200).json(q);
  }
};

// GET: /trips/:tripCode - lists a single trip
const tripsFindByCode = async(req, res) => {
  const q = await Model
      .find({ 'code' : req.params.tripCode }) // Return single record
      .exec();

  if(!q) {
      return res.status(404).json(err);
  } else {
      return res.status(200).json(q);
  }
};

// POST: /trips - Adds a new Trip
const tripsAddTrip = async (req, res) => {
  getUser(req, res, (req, res, user) => {
    const newTrip = new Trip({
      code: req.body.code,
      name: req.body.name,
      length: req.body.length,
      start: req.body.start,
      resort: req.body.resort,
      perPerson: req.body.perPerson,
      image: req.body.image,
      description: req.body.description
    });

    newTrip.save((err, trip) => {
      if (err) {
        return res.status(400).json(err);
      } else {
        return res.status(201).json(trip);
      }
    });
  });
};

// PUT: /trips/:tripCode - Updates an existing Trip
const tripsUpdateTrip = async (req, res) => {
  getUser(req, res, (req, res, user) => {
    Model.findOneAndUpdate(
      { 'code': req.params.tripCode },
      {
        code: req.body.code,
        name: req.body.name,
        length: req.body.length,
        start: req.body.start,
        resort: req.body.resort,
        perPerson: req.body.perPerson,
        image: req.body.image,
        description: req.body.description
      }, { new: true }
    )
    .exec((err, trip) => {
      if (err) {
        return res.status(400).json(err);
      } else if (!trip) {
        return res.status(404).json({
          "message": "Trip not found"
        });
      } else {
        return res.status(200).json(trip);
      }
    });
  });
};

module.exports = {
  tripsList,
  tripsFindByCode,
  tripsAddTrip,
  tripsUpdateTrip,
  User
};
