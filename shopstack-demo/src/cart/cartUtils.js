// ShopStack — Cart Utilities
function calculateCartTotal(items) {
  if (!items || items.length === 0) {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return Math.round(total * 100) / 100;
}

function formatCurrency(amount) {
  return '$' + amount.toFixed(2);
}

function validateCartItem(item) {
  return item &&
    typeof item.productId === 'string' &&
    typeof item.price === 'number' &&
    item.price >= 0 &&
    typeof item.quantity === 'number' &&
    item.quantity > 0;
}

module.exports = { calculateCartTotal, formatCurrency, validateCartItem };
