// 📂 travlr/app_api/models/cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  code: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  name: { type: String,required: true }, // Remove required but keep field
  image: String
});

const cartSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [cartItemSchema],
  total: { type: Number, default: 0 }
});

mongoose.model('Cart', cartSchema);