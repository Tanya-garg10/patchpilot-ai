// ShopStack — Cart Tests
const { addItem, removeItem, clearCart, getCart } = require('../src/cart/cartService');

describe('Cart Service', () => {
  const userId = 'test-user';
  const productA = { id: 'p001', name: 'Headphones', price: 79.99 };
  const productB = { id: 'p002', name: 'Keyboard', price: 129.99 };

  beforeEach(() => {
    clearCart(userId);
  });

  test('adds item to empty cart', () => {
    const cart = addItem(userId, productA, 1);
    expect(cart.items).toHaveLength(1);
    expect(cart.total).toBe(79.99);
  });

  test('removes one item from multi-item cart', () => {
    addItem(userId, productA, 1);
    addItem(userId, productB, 1);
    const cart = removeItem(userId, productA.id);
    expect(cart.items).toHaveLength(1);
    expect(cart.total).toBe(129.99);
  });

  test('cart total recalculates with multiple quantities', () => {
    addItem(userId, productA, 3);
    const cart = getCart(userId);
    expect(cart.total).toBe(239.97);
  });

  test('removing final item should produce empty cart with total 0', () => {
    addItem(userId, productA, 1);
    const cart = removeItem(userId, productA.id);
    expect(cart.items).toHaveLength(0);
    expect(cart.total).toBe(0);
  });

  test('cart total should never be negative', () => {
    addItem(userId, productA, 1);
    removeItem(userId, productA.id);
    const cart = getCart(userId);
    expect(cart.total).toBeGreaterThanOrEqual(0);
  });
});
