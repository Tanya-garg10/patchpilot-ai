// ShopStack — Cart Service
const { calculateCartTotal } = require('./cartUtils');

let cartStore = {};

function getCart(userId) {
  return cartStore[userId] || { items: [], total: 0 };
}

function addItem(userId, product, quantity) {
  const cart = getCart(userId);
  const existing = cart.items.find(i => i.productId === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ productId: product.id, name: product.name, price: product.price, quantity });
  }
  cart.total = calculateCartTotal(cart.items);
  cartStore[userId] = cart;
  return cart;
}

function removeItem(userId, productId) {
  const cart = getCart(userId);
  const index = cart.items.findIndex(i => i.productId === productId);
  if (index === -1) return cart;
  cart.items.splice(index, 1);
  if (cart.items.length === 0) {
    cart.total = calculateCartTotal(cart.items);
    return cart;
  }
  cart.total = calculateCartTotal(cart.items);
  cartStore[userId] = cart;
  return cart;
}

function clearCart(userId) {
  cartStore[userId] = { items: [], total: 0 };
  return cartStore[userId];
}

module.exports = { getCart, addItem, removeItem, clearCart };
