// ShopStack — Cart API Routes
const express = require('express');
const router = express.Router();
const {
  handleGetCart,
  handleAddItem,
  handleRemoveItem,
  handleClearCart,
} = require('../cart/cartController');

router.get('/:userId', handleGetCart);
router.post('/:userId/items', handleAddItem);
router.delete('/:userId/items/:productId', handleRemoveItem);
router.delete('/:userId', handleClearCart);

module.exports = router;
