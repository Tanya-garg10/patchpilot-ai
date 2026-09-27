// ============================================================
// PatchPilot — ShopStack Demo Data
// Bug: Cart total becomes negative after removing the last item
// ============================================================

import { v4 as uuid } from 'uuid';
import {
  Project,
  DebugSession,
  AnalysisResult,
  GeneratedFix,
} from './types';

// ----------------------------------------------------------------
// ShopStack Project
// ----------------------------------------------------------------

export const SHOPSTACK_PROJECT_ID = 'shopstack-demo-001';

export const SHOPSTACK_PROJECT: Project = {
  id: SHOPSTACK_PROJECT_ID,
  name: 'ShopStack Demo',
  description:
    'A lightweight e-commerce cart service demonstrating the PatchPilot debugging workflow. Includes an intentional reproducible bug in cart state management.',
  repository: 'https://github.com/example/shopstack-demo',
  language: 'javascript',
  framework: 'express',
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
};

// ----------------------------------------------------------------
// ShopStack source files
// ----------------------------------------------------------------

export const SHOPSTACK_FILES: Record<string, string> = {
  'src/cart/cartService.js': `// ShopStack — Cart Service
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

module.exports = { getCart, addItem, removeItem, clearCart };`,

  'src/cart/cartUtils.js': `// ShopStack — Cart Utilities
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

module.exports = { calculateCartTotal, formatCurrency, validateCartItem };`,

  'src/cart/cartController.js': `// ShopStack — Cart Controller
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

module.exports = { handleGetCart, handleAddItem, handleRemoveItem, handleClearCart };`,

  'src/products/productService.js': `// ShopStack — Product Service
const products = [
  { id: 'p001', name: 'Wireless Headphones', price: 79.99, category: 'Electronics' },
  { id: 'p002', name: 'Mechanical Keyboard', price: 129.99, category: 'Electronics' },
  { id: 'p003', name: 'USB-C Hub', price: 39.99, category: 'Accessories' },
  { id: 'p004', name: 'Webcam HD', price: 59.99, category: 'Electronics' },
  { id: 'p005', name: 'Desk Mat XL', price: 24.99, category: 'Accessories' },
];

function getAllProducts() {
  return products;
}

function getProductById(id) {
  return products.find(p => p.id === id) || null;
}

function searchProducts(query) {
  const q = query.toLowerCase();
  return products.filter(
    p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  );
}

module.exports = { getAllProducts, getProductById, searchProducts };`,

  'src/api/cartRoutes.js': `// ShopStack — Cart API Routes
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

module.exports = router;`,

  'tests/cart.test.js': `// ShopStack — Cart Tests
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
});`,
};

// ----------------------------------------------------------------
// Demo Bug Report
// ----------------------------------------------------------------

export const DEMO_BUG_SESSION_ID = 'shopstack-bug-session-001';

export const DEMO_BUG_REPORT: Omit<DebugSession, 'id'> = {
  projectId: SHOPSTACK_PROJECT_ID,
  title: 'Cart total becomes negative after removing the last item',
  bugReport:
    'When a user has a single item in their cart and removes it, the cart total can become invalid or negative instead of returning to 0. This affects the checkout flow and can allow users to proceed with an incorrect cart state.',
  expectedBehavior:
    'Removing the final cart item should produce an empty cart with a total of exactly $0.00. The cart state should be fully reset.',
  actualBehavior:
    'After removing the last item, the cart store is not properly updated. The stale cart object is returned without persisting the zeroed state, meaning subsequent reads can return invalid or unexpected total values.',
  reproductionSteps: [
    "Add exactly one item to the cart (e.g., 'Wireless Headphones' — $79.99)",
    'Confirm the cart shows 1 item and total = $79.99',
    "Remove the item using DELETE /cart/:userId/items/:productId",
    'Observe the returned cart object',
    'Perform a subsequent GET /cart/:userId to read the persisted state',
    'Note: the in-memory cartStore may not reflect the zeroed state',
  ],
  status: 'open',
  analysis: null,
  generatedFix: null,
  fixApplied: false,
  appliedAt: null,
  changedFiles: [],
  verificationStatus: null,
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
};

// ----------------------------------------------------------------
// Demo Analysis Result (DemoProvider)
// ----------------------------------------------------------------

export const DEMO_ANALYSIS: AnalysisResult = {
  rootCause:
    'In cartService.js:removeItem(), when the last item is removed (items.length === 0 after splice), the function calculates the correct total (0) but returns the cart object WITHOUT saving it back to cartStore. The early return on line 25 skips the `cartStore[userId] = cart` assignment, so the in-memory store retains the old state. A subsequent getCart() call re-reads the unmodified store, returning stale data.',
  confidence: 94,
  affectedFiles: ['src/cart/cartService.js'],
  suspiciousLines: [
    {
      file: 'src/cart/cartService.js',
      line: 25,
      code: "    if (cart.items.length === 0) {\n      cart.total = calculateCartTotal(cart.items);\n      return cart;\n    }",
      reason:
        'Early return path does not persist the zeroed cart back to cartStore. The fix (return cart) is reached before the cartStore[userId] = cart assignment.',
    },
  ],
  explanation:
    'The removeItem function contains a defensive early-return branch that was added to handle the empty-cart case. However, this branch correctly computes total=0 but exits before executing `cartStore[userId] = cart`. As a result, the in-memory store is never updated when the last item is removed. The next call to getCart() will retrieve the unmodified store entry, which still holds the previous item list and total. This produces the observed stale/incorrect state.',
  recommendedFix:
    'Remove the early-return branch for empty carts. The assignment `cartStore[userId] = cart` should always execute after the items array is mutated, regardless of whether the cart is now empty. Then return the cart. This ensures the store is always in sync with the in-memory cart object.',
  risks: [
    'Minimal — the fix only ensures persistence happens unconditionally',
    'No change to business logic or total calculation',
    'Existing test coverage verifies the corrected behavior',
  ],
  edgeCases: [
    'Cart already empty when removeItem is called — getCart initializes a fresh cart, so no item will be found and no mutation occurs (safe)',
    'Concurrent requests for same userId — not applicable in single-threaded Node.js in-memory store',
    'Item not found in cart — already handled by the index === -1 guard on line 21',
  ],
};

// ----------------------------------------------------------------
// Demo Generated Fix (DemoProvider)
// ----------------------------------------------------------------

export const DEMO_FIX: GeneratedFix = {
  problem:
    'removeItem() does not persist the cart to cartStore when the last item is removed, leaving stale state.',
  rootCause:
    'The early-return branch for empty carts returns the cart object before executing the `cartStore[userId] = cart` save, so the store is never updated.',
  filesToChange: ['src/cart/cartService.js'],
  explanation:
    'Remove the special-case early-return block for empty carts (lines 24-27). After splicing the item from the array, always assign `cartStore[userId] = cart` and then return the cart. This makes the save unconditional and ensures the store reflects the correct empty state.',
  risk: 'Low — isolated to a single code path with no behavioral change beyond correct persistence.',
  edgeCases: [
    'Already-empty cart: getCart() initializes a default {items:[], total:0} object — removeItem returns early with index===-1 guard, so cartStore is unchanged (correct).',
    'Multi-item cart: unaffected — the early-return branch was only hit when items.length === 0.',
  ],
  verificationPlan: [
    'Add one item, remove it, call getCart() — assert total === 0 and items.length === 0',
    'Add two items, remove one — assert remaining item and correct total',
    'Verify cart.total is never negative across all test scenarios',
    'Run the full test suite — all 5 existing tests should pass',
  ],
  diffs: [
    {
      file: 'src/cart/cartService.js',
      before: `function removeItem(userId, productId) {
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
}`,
      after: `function removeItem(userId, productId) {
  const cart = getCart(userId);
  const index = cart.items.findIndex(i => i.productId === productId);
  if (index === -1) return cart;
  cart.items.splice(index, 1);
  cart.total = calculateCartTotal(cart.items);
  cartStore[userId] = cart;
  return cart;
}`,
      explanation:
        'Removed the early-return branch for empty carts. Now cartStore[userId] is always updated after any item removal, ensuring persistent state is always correct.',
    },
  ],
};

// ----------------------------------------------------------------
// Demo Test Cases
// ----------------------------------------------------------------

export const DEMO_TEST_CASES = [
  {
    name: 'Remove final cart item → empty cart',
    description:
      'Add one item, remove it, assert cart is empty with total === 0.',
    code: `test('removing final item should produce empty cart with total 0', () => {
  clearCart(userId);
  addItem(userId, { id: 'p001', name: 'Headphones', price: 79.99 }, 1);
  const cart = removeItem(userId, 'p001');
  expect(cart.items).toHaveLength(0);
  expect(cart.total).toBe(0);
  // Verify persisted state
  const stored = getCart(userId);
  expect(stored.total).toBe(0);
  expect(stored.items).toHaveLength(0);
});`,
  },
  {
    name: 'Empty cart total equals zero',
    description: 'Fresh cart for a new user must always have total === 0.',
    code: `test('empty cart total equals zero', () => {
  const cart = getCart('brand-new-user-' + Date.now());
  expect(cart.items).toHaveLength(0);
  expect(cart.total).toBe(0);
});`,
  },
  {
    name: 'Remove one item from multi-item cart',
    description: 'Add two items, remove one, assert correct remaining total.',
    code: `test('remove one item from multi-item cart', () => {
  clearCart(userId);
  addItem(userId, { id: 'p001', name: 'Headphones', price: 79.99 }, 1);
  addItem(userId, { id: 'p002', name: 'Keyboard', price: 129.99 }, 1);
  const cart = removeItem(userId, 'p001');
  expect(cart.items).toHaveLength(1);
  expect(cart.total).toBe(129.99);
});`,
  },
  {
    name: 'Multiple quantities recalculation',
    description: 'Add 3 units of one product, assert total = price × quantity.',
    code: `test('multiple quantities recalculation', () => {
  clearCart(userId);
  addItem(userId, { id: 'p001', name: 'Headphones', price: 79.99 }, 3);
  const cart = getCart(userId);
  expect(cart.total).toBe(239.97);
});`,
  },
  {
    name: 'Cart recalculation after sequential operations',
    description: 'Add, remove, add again — total must reflect final state.',
    code: `test('cart recalculation after sequential operations', () => {
  clearCart(userId);
  addItem(userId, { id: 'p001', name: 'Headphones', price: 79.99 }, 1);
  removeItem(userId, 'p001');
  addItem(userId, { id: 'p002', name: 'Keyboard', price: 129.99 }, 2);
  const cart = getCart(userId);
  expect(cart.total).toBe(259.98);
  expect(cart.items).toHaveLength(1);
});`,
  },
  {
    name: 'Negative total prevention',
    description: 'Under no operation sequence should cart.total become negative.',
    code: `test('cart total should never be negative', () => {
  clearCart(userId);
  addItem(userId, { id: 'p001', name: 'Headphones', price: 79.99 }, 1);
  removeItem(userId, 'p001');
  const cart = getCart(userId);
  expect(cart.total).toBeGreaterThanOrEqual(0);
});`,
  },
];
