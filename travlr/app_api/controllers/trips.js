const mongoose = require("mongoose");
const Trip = require("../models/travlr");
const Model = mongoose.model("trips");

const tripsList = async (req, res) => {
  const q = await Model.find({}).exec();
  console.log(q);

  if (!q) {
    return res.status(404).json(arr);
  } else {
    return res.status(200).json(q);
  }
};

const tripsFindByCode = async (req, res) => {
  const q = await Model.find({ code: req.params.tripCode }).exec();
  console.log(q);

  if (!q) {
    return res.status(404).json(arr);
  } else {
    return res.status(200).json(q);
  }
};
const getUser = (req, res, callback) => {
  if (req.params.tripId) {
    Trip
      .findById(req.params.tripId)
      .select('users')
      .exec((err, trip) => {
        if (err) {
          res.status(400).json(err);
          return;
        } else if (!trip) {
          res.status(404).json({ 
            "message": "Trip not found" 
          });
          return;
        }
        
        if (callback) {
          callback(req, res, trip);
        }
      });
  } else {
    res.status(404).json({
      "message": "Not found, tripId required"
    });
  }
};

const tripsAddTrip = async (req, res) => {
  getUser(req, res,
  (req, res) => {
  Trip
  .create({
  code: req.body.code,
 name: req.body.name,
 length: req.body.length,
 start: req.body.start,
 resort: req.body.resort,
 perPerson: req.body.perPerson,
 image: req.body.image,
 description: req.body.description
  },
  (err, trip) => {
  if (err) {
  return res
  .status(400) // bad request
 .json(err);
  } else {
  return res
  .status(201) // created
 .json(trip);
  }
  });
  }
  );
 } 
// PUT: /trips/:tripCode - Adds a new Trip
// Regardless of outcome, response must include HTML status code
// and JSON message to the requesting client
const tripsUpdateTrip = async (req, res) => {
  getUser(req, res,
  (req, res) => {
  Trip
  .findOneAndUpdate({'code': req.params.tripCode },{
  code: req.body.code,
 name: req.body.name,
 length: req.body.length,
 start: req.body.start,
 resort: req.body.resort,
 perPerson: req.body.perPerson,
 image: req.body.image,
 description: req.body.description
  }, { new: true })
  .then(trip => {
  if (!trip) {
  return res
  .status(404)
 .send({
  message: "Trip not found with code" + req.params.tripCode
  });
  }
 res.send(trip);
  }).catch(err => {
  if (err.kind === 'ObjectId') {
  return res
  .status(404)
 .send({
  message: "Trip not found with code" + req.params.tripCode
  });
  }
 return res
  .status(500) // server error
 .json(err);
  });
  }
  );
 } 
module.exports = {
  tripsList,
  tripsFindByCode,
  tripsAddTrip,
  tripsUpdateTrip,
};
