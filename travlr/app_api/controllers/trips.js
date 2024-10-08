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

module.exports = {
  tripsList
};
