const mongoose = require('mongoose');
const Cart = mongoose.model('Cart');
const Trip = mongoose.model('Trip');

const getCart = async (req, res) => {
  if (!req.auth || !req.auth._id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    let cart = await Cart.findOne({ userId: req.auth._id });
    if (!cart) {
      cart = new Cart({ userId: req.auth._id, items: [], total: 0 });
      await cart.save();
    }
    res.status(200).json(cart);
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ 
      message: 'Error retrieving cart', 
      error: err.message 
    });
  }
};

const addToCart = async (req, res) => {
  try {
    // Validate authentication
    if (!req.auth || !req.auth._id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate request body
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid cart data' });
    }

    // Extract first item details
    const { code, price, name, quantity = 1, image = '' } = items[0];

    // Validate required fields
    if (!code) {
      return res.status(400).json({ message: 'Trip code is required' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.auth._id });
    if (!cart) {
      cart = new Cart({
        userId: req.auth._id,
        items: [],
        total: 0
      });
    }

    // Find the trip
    const trip = await Trip.findOne({ code: code });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Determine price
    const itemPrice = price || parseFloat(trip.perPerson);
    if (isNaN(itemPrice)) {
      return res.status(400).json({ message: 'Invalid trip price' });
    }

    // Check for existing item in cart
    const existingItemIndex = cart.items.findIndex(item => item.code === code);

    if (existingItemIndex > -1) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        code: code,
        name: name || trip.name,
        price: itemPrice,
        quantity: quantity,
        image: image || trip.image || ''
      });
    }

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );

    // Save and return updated cart
    await cart.save();
    res.status(200).json(cart);

  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ 
      message: 'Error adding item to cart', 
      error: err.message 
    });
  }
};

const updateCart = async (req, res) => {
  try {
    // Validate authentication
    if (!req.auth || !req.auth._id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate request body
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid cart data' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.auth._id });
    if (!cart) {
      cart = new Cart({ userId: req.auth._id, items: [], total: 0 });
    }

    // Validate and update items
    const validatedItems = await Promise.all(items.map(async (item) => {
      // Ensure each item has a code
      if (!item.code) {
        throw new Error('Each cart item must have a code');
      }

      // Verify trip exists
      const trip = await Trip.findOne({ code: item.code });
      if (!trip) {
        throw new Error(`Trip with code ${item.code} not found`);
      }

      // Return validated item
      return {
        code: item.code,
        name: item.name || trip.name,
        price: item.price || parseFloat(trip.perPerson),
        quantity: item.quantity || 1,
        image: item.image || trip.image || ''
      };
    }));

    // Update cart items
    cart.items = validatedItems;

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );

    // Save and return updated cart
    await cart.save();
    res.status(200).json(cart);

  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ 
      message: 'Error updating cart', 
      error: err.message 
    });
  }
};

const removeFromCart = async (req, res) => {
  if (!req.auth || !req.auth._id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const code = req.params.code;
    if (!code) {
      return res.status(400).json({ message: 'Item code is required' });
    }

    let cart = await Cart.findOne({ userId: req.auth._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove item with matching code
    cart.items = cart.items.filter(item => item.code !== code);
    
    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ 
      message: 'Error removing item from cart', 
      error: err.message 
    });
  }
};

const clearCart = async (req, res) => {
  try {
    if (!req.auth || !req.auth._id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const cart = await Cart.findOne({ userId: req.auth._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Clear items and reset total
    cart.items = [];
    cart.total = 0;
    await cart.save();

    res.status(200).json({ 
      message: 'Cart cleared successfully', 
      cart 
    });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ 
      message: 'Error clearing cart', 
      error: err.message 
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCart,
  clearCart,
  removeFromCart
};