const mongoose = require("mongoose");
const Trip = require("../models/travlr");
const Model = mongoose.model("trips");

const tripsList = async (req, res) => {
  const q = await Model.find({}).exec();
  console.log(q);

  if (!q) {
    return res.status(404).json({ message: "No trips found" });
  } else {
    return res.status(200).json(q);
  }
};

const tripsFindByCode = async (req, res) => {
  const q = await Model.find({ code: req.params.tripCode }).exec();
  console.log(q);

  if (!q) {
    return res.status(404).json({ message: "Trip not found" });
  } else {
    return res.status(200).json(q);
  }
};

const getUser = (req, res, callback) => {
  if (req.params.tripId) {
    Trip.findById(req.params.tripId)
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
  try {
    const newTrip = await Trip.create({
      code: req.body.code,
      name: req.body.name,
      length: req.body.length,
      start: req.body.start,
      resort: req.body.resort,
      perPerson: req.body.perPerson,
      image: req.body.image,
      description: req.body.description
    });
    
    return res.status(201).json(newTrip);
  } catch (err) {
    return res.status(400).json(err);
  }
};

const tripsUpdateTrip = async (req, res) => {
  try {
    console.log('Update request received for trip code:', req.params.tripCode);
    console.log('Update data:', req.body);

    const existingTrip = await Trip.findOne({ code: req.params.tripCode });
    if (!existingTrip) {
      return res.status(404).json({
        message: "Trip not found with code " + req.params.tripCode
      });
    }

    const updatedTrip = await Trip.findOneAndUpdate(
      { code: req.params.tripCode },
      {
        code: req.body.code,
        name: req.body.name,
        length: req.body.length,
        start: req.body.start,
        resort: req.body.resort,
        perPerson: req.body.perPerson,
        image: req.body.image,
        description: req.body.description
      },
      { new: true }
    );

    if (!updatedTrip) {
      return res.status(404).json({
        message: "Failed to update trip with code " + req.params.tripCode
      });
    }

    return res.status(200).json(updatedTrip);
  } catch (err) {
    console.error('Error updating trip:', err);
    return res.status(500).json({
      message: "Error updating trip with code " + req.params.tripCode,
      error: err.message
    });
  }
};

module.exports = {
  tripsList,
  tripsFindByCode,
  tripsAddTrip,
  tripsUpdateTrip,
};

