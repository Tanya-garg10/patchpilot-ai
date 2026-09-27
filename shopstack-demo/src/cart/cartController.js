// ShopStack — Cart Controller
const cartService = require('./cartService');

function handleGetCart(req, res) {
  try {
    const { userId } = req.params;
    const cart = cartService.getCart(userId);
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

function handleAddItem(req, res) {
  try {
    const { userId } = req.params;
    const { product, quantity } = req.body;
    const cart = cartService.addItem(userId, product, quantity || 1);
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

function handleRemoveItem(req, res) {
  try {
    const { userId, productId } = req.params;
    const cart = cartService.removeItem(userId, productId);
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

function handleClearCart(req, res) {
  try {
    const { userId } = req.params;
    const cart = cartService.clearCart(userId);
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { handleGetCart, handleAddItem, handleRemoveItem, handleClearCart };
