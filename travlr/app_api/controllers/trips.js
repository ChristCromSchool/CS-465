const mongoose = require("mongoose");
const Trip = require("../models/travlr");
const Model = mongoose.model("trips");

const tripsList = async (req, res) => {
  try {
    const trips = await Model.find({}).exec();
    console.log(trips);

    if (!trips || trips.length === 0) {
      return res.status(404).json({ message: "No trips found" });
    }
    return res.status(200).json(trips);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const tripsFindByCode = async (req, res) => {
  try {
    const trip = await Model.find({ code: req.params.tripCode }).exec();
    console.log(trip);

    if (!trip || trip.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }
    return res.status(200).json(trip);
  } catch (err) {
    return res.status(500).json({ error: err.message });
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
        }
        callback(req, res, trip);
      });
  }
};

const tripsUpdateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ code: req.params.tripCode });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    trip.code = req.body.code;
    trip.name = req.body.name;
    trip.length = req.body.length;
    trip.start = req.body.start;
    trip.resort = req.body.resort;
    trip.perPerson = req.body.perPerson;
    trip.image = req.body.image;
    trip.description = req.body.description;
    
    await trip.save();
    res.status(200).json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  tripsList,
  tripsFindByCode,
  getUser,
  tripsUpdateTrip
};

const getPaginatedTrips = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 3; // Default to 3
    const query = req.query.query || '';

    const filter = query ? {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { resort: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    } : {};

    const total = await Trip.countDocuments(filter);
    const trips = await Trip.find(filter)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      trips,
      total,
      page,
      pageSize
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add index for better search performance
Trip.collection.createIndex({
  name: 'text',
  resort: 'text',
  description: 'text'
});

module.exports = {
  tripsList,
  tripsFindByCode,
  getUser,
  getPaginatedTrips,
  tripsUpdateTrip
};

const tripSchema = mongoose.Schema({
  // Existing fields...
  inventory: {
    type: Number,
    required: true,
    default: 10
  }
});

mongoose.model('Trip', tripSchema);
