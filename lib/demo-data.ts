// ============================================================
// PatchPilot — ShopStack Demo Data
// Bug: Cart quantity resets after navigating back to the cart
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
  name: 'ShopStack',
  description:
    'A modern e-commerce application used to demonstrate PatchPilot\'s autonomous debugging workflow. Built with React, TypeScript, and Zustand for state management.',
  repository: 'https://github.com/example/shopstack',
  language: 'typescript',
  framework: 'react',
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
};

// ----------------------------------------------------------------
// ShopStack source files (TypeScript/React — BUG-1042)
// ----------------------------------------------------------------

export const SHOPSTACK_FILES: Record<string, string> = {
  'src/features/cart/useCart.ts': `// ShopStack — useCart Hook
import { useState, useEffect } from 'react';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

// ⚠ BUG: Cart state is local — recreated on every component remount.
// When the user navigates away and returns, useCart() initialises
// a fresh empty state, discarding the previous quantity selection.
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  function addItem(product: { id: string; name: string; price: number }, qty = 1) {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: qty }];
    });
  }

  function removeItem(productId: string) {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev =>
      prev.map(i => i.productId === productId ? { ...i, quantity } : i)
    );
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return { items, total, addItem, removeItem, updateQuantity };
}`,

  'src/features/cart/cartStore.ts': `// ShopStack — Cart Store (Zustand)
// This file exists but is NOT used by Cart.tsx or useCart.ts.
// The fix is to migrate useCart.ts to use this persistent store.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: { id: string; name: string; price: number }, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, qty = 1) =>
        set((state) => {
          const existing = state.items.find(i => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { productId: product.id, name: product.name, price: product.price, quantity: qty }],
          };
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter(i => i.productId !== productId) })),
      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) return { items: state.items.filter(i => i.productId !== productId) };
          return { items: state.items.map(i => i.productId === productId ? { ...i, quantity } : i) };
        }),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'shopstack-cart' }
  )
);`,

  'src/features/cart/Cart.tsx': `// ShopStack — Cart Component
import React from 'react';
import { useCart } from './useCart';  // ⚠ Uses local state hook, not cartStore

export function Cart() {
  // useCart() returns a fresh empty state on every remount.
  // Navigating away and back triggers unmount → remount → empty cart.
  const { items, total, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="cart">
      <h2>Your Cart</h2>
      {items.map(item => (
        <div key={item.productId} className="cart-item">
          <span>{item.name}</span>
          <input
            type="number"
            value={item.quantity}
            min={1}
            onChange={e => updateQuantity(item.productId, Number(e.target.value))}
          />
          <span>\${(item.price * item.quantity).toFixed(2)}</span>
          <button onClick={() => removeItem(item.productId)}>Remove</button>
        </div>
      ))}
      <div className="cart-total">Total: \${total.toFixed(2)}</div>
    </div>
  );
}`,

  'src/pages/CartPage.tsx': `// ShopStack — Cart Page
import React from 'react';
import { Cart } from '../features/cart/Cart';
import { Link } from 'react-router-dom';

export function CartPage() {
  return (
    <div className="page cart-page">
      <header>
        <Link to="/">← Continue Shopping</Link>
        <h1>Shopping Cart</h1>
      </header>
      <Cart />
      <footer>
        <Link to="/checkout">Proceed to Checkout →</Link>
      </footer>
    </div>
  );
}`,

  'src/pages/ProductPage.tsx': `// ShopStack — Product Page
import React from 'react';
import { useCart } from '../features/cart/useCart';  // ⚠ Same local-state hook
import { Link } from 'react-router-dom';

const PRODUCTS = [
  { id: 'p001', name: 'Wireless Headphones', price: 79.99 },
  { id: 'p002', name: 'Mechanical Keyboard', price: 129.99 },
  { id: 'p003', name: 'USB-C Hub', price: 39.99 },
];

export function ProductPage() {
  const { addItem } = useCart();  // ⚠ New hook instance — separate state from Cart.tsx

  return (
    <div className="page product-page">
      <header>
        <Link to="/cart">View Cart</Link>
      </header>
      <div className="products">
        {PRODUCTS.map(product => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>\${product.price}</p>
            <button onClick={() => addItem(product)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}`,

  'src/lib/router.tsx': `// ShopStack — App Router
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<div>Checkout</div>} />
      </Routes>
    </BrowserRouter>
  );
}`,
};

// ----------------------------------------------------------------
// Demo Bug Report (BUG-1042)
// ----------------------------------------------------------------

export const DEMO_BUG_SESSION_ID = 'shopstack-bug-1042';

export const DEMO_BUG_REPORT: Omit<DebugSession, 'id'> = {
  projectId: SHOPSTACK_PROJECT_ID,
  title: 'Cart quantity resets after navigating back to the cart',
  bugReport:
    'BUG-1042: When a user adds items to the cart, increases the quantity, then navigates to the product page and returns to the cart, all cart state (items and quantities) has been lost. The cart appears empty on return navigation, forcing the user to start over.',
  expectedBehavior:
    'Cart items and quantities should persist across navigation. The Zustand cartStore with persist middleware is already configured for this purpose. The cart should show the same items and quantities after navigating away and back.',
  actualBehavior:
    'The Cart component uses the local useCart() hook which creates independent useState instances. On component unmount (navigation away) all state is lost. On remount (navigation back) a fresh empty state is created. The cartStore with persist middleware exists but is never consumed.',
  reproductionSteps: [
    'Open ShopStack and go to the Products page',
    'Add "Wireless Headphones" to the cart',
    'Navigate to the Cart page — confirm 1 item, quantity 1',
    'Increase quantity to 3 using the quantity input',
    'Click "← Continue Shopping" to navigate back to Products',
    'Click "View Cart" to navigate back to Cart',
    'Observe: cart is empty — all items and quantity lost',
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
// Demo Analysis Result — Investigator Agent output
// ----------------------------------------------------------------

export const DEMO_ANALYSIS: AnalysisResult = {
  rootCause:
    'Cart.tsx and ProductPage.tsx both instantiate the local useCart() hook which creates independent React useState instances. On every component unmount/remount cycle (triggered by route navigation), useState returns a fresh empty array. The persistent cartStore (Zustand + persist middleware) already exists in cartStore.ts but is never imported or consumed by either component. The fix is to replace the useCart() import with useCartStore() in Cart.tsx and ProductPage.tsx.',
  confidence: 94,
  affectedFiles: [
    'src/features/cart/Cart.tsx',
    'src/features/cart/useCart.ts',
    'src/features/cart/cartStore.ts',
  ],
  suspiciousLines: [
    {
      file: 'src/features/cart/useCart.ts',
      line: 11,
      code: '  const [items, setItems] = useState<CartItem[]>([]);',
      reason:
        'Local useState initialises to an empty array on every hook call. There is no persistence — unmounting the component discards all state.',
    },
    {
      file: 'src/features/cart/Cart.tsx',
      line: 8,
      code: "  const { items, total, updateQuantity, removeItem } = useCart();",
      reason:
        'Consumes the local useCart() hook instead of the persistent useCartStore(). This is the primary call site causing the loss of cart state on remount.',
    },
    {
      file: 'src/pages/ProductPage.tsx',
      line: 13,
      code: '  const { addItem } = useCart();  // ⚠ New hook instance — separate state from Cart.tsx',
      reason:
        'ProductPage also instantiates useCart() independently, meaning addItem() mutates a different state object than the one Cart.tsx reads.',
    },
  ],
  explanation:
    'The investigation found that cartStore.ts implements the correct persistent solution using Zustand\'s persist middleware, but neither Cart.tsx nor ProductPage.tsx use it. Both components call useCart() which creates component-local React state. This state is created fresh on every mount. Route navigation causes unmount, destroying the state. The Zustand store is never written to, so persistence is never triggered. The solution is minimal: replace two import statements and hook calls.',
  recommendedFix:
    'In Cart.tsx: replace `import { useCart } from \'./useCart\'` with `import { useCartStore as useCart } from \'./cartStore\'`. In ProductPage.tsx: apply the same import change. No logic changes are required — the cartStore API is compatible with the existing component code.',
  risks: [
    'Low — the cartStore API is a strict superset of useCart()',
    'Cart state will now persist in localStorage (zustand/persist) — expected behavior',
    'Existing quantity and item logic is identical between both implementations',
  ],
  edgeCases: [
    'SSR / hydration: Zustand persist reads from localStorage on mount — may cause a brief flash of empty cart on first render. Suppress with Suspense or a loading guard if needed.',
    'Multiple browser tabs: each tab shares the localStorage key. Simultaneous updates in two tabs may conflict — acceptable for this use case.',
    'Cart clearing on checkout: useCartStore exposes clearCart() — wire this up in the checkout flow.',
  ],
};

// ----------------------------------------------------------------
// Demo Generated Fix — Fix Agent output
// ----------------------------------------------------------------

export const DEMO_FIX: GeneratedFix = {
  problem:
    'Cart state is destroyed on every navigation because Cart.tsx uses component-local useState via useCart().',
  rootCause:
    'useCart() creates independent React useState instances that are discarded on component unmount. The persistent Zustand cartStore is unused.',
  filesToChange: ['src/features/cart/Cart.tsx', 'src/pages/ProductPage.tsx'],
  explanation:
    'Replace the useCart() import with the persistent useCartStore() in both Cart.tsx and ProductPage.tsx. The store API is compatible — no component logic changes required. Cart items and quantities will now survive route navigation via Zustand persist middleware.',
  risk: 'Low — isolated import change. No business logic modified.',
  edgeCases: [
    'SSR hydration flash — mitigate with a mounted guard if needed',
    'localStorage availability — Zustand persist handles missing storage gracefully',
  ],
  verificationPlan: [
    'Add item → navigate away → return → assert item still present',
    'Increase quantity → navigate → return → assert quantity preserved',
    'Add multiple items → navigate → return → assert all items present',
    'Empty cart stays empty after navigation',
    'Checkout clears cart correctly',
  ],
  diffs: [
    {
      file: 'src/features/cart/Cart.tsx',
      before: `import React from 'react';
import { useCart } from './useCart';  // ⚠ Uses local state hook, not cartStore

export function Cart() {
  // useCart() returns a fresh empty state on every remount.
  // Navigating away and back triggers unmount → remount → empty cart.
  const { items, total, updateQuantity, removeItem } = useCart();`,
      after: `import React from 'react';
import { useCartStore } from './cartStore';

export function Cart() {
  // useCartStore() reads from Zustand with persist middleware.
  // State survives component unmount and route navigation.
  const { items, updateQuantity, removeItem } = useCartStore();
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);`,
      explanation:
        'Replace local useCart() with persistent useCartStore(). Cart state now survives navigation. Total is computed inline from the store\'s items array.',
    },
    {
      file: 'src/pages/ProductPage.tsx',
      before: `import { useCart } from '../features/cart/useCart';  // ⚠ Same local-state hook
import { Link } from 'react-router-dom';

const PRODUCTS = [
  { id: 'p001', name: 'Wireless Headphones', price: 79.99 },
  { id: 'p002', name: 'Mechanical Keyboard', price: 129.99 },
  { id: 'p003', name: 'USB-C Hub', price: 39.99 },
];

export function ProductPage() {
  const { addItem } = useCart();  // ⚠ New hook instance — separate state from Cart.tsx`,
      after: `import { useCartStore } from '../features/cart/cartStore';
import { Link } from 'react-router-dom';

const PRODUCTS = [
  { id: 'p001', name: 'Wireless Headphones', price: 79.99 },
  { id: 'p002', name: 'Mechanical Keyboard', price: 129.99 },
  { id: 'p003', name: 'USB-C Hub', price: 39.99 },
];

export function ProductPage() {
  const { addItem } = useCartStore();  // ✓ Shared persistent store`,
      explanation:
        'ProductPage now writes to the same Zustand store that Cart reads from. Both components share a single source of truth.',
    },
  ],
};

// ----------------------------------------------------------------
// Demo Test Cases
// ----------------------------------------------------------------

export const DEMO_TEST_CASES = [
  {
    name: 'Cart persists after route navigation',
    description:
      'Add item, simulate navigation (unmount + remount), assert cart item still present.',
    code: `test('cart persists after route navigation', () => {
  const store = useCartStore.getState();
  store.clearCart();
  store.addItem({ id: 'p001', name: 'Wireless Headphones', price: 79.99 }, 1);
  // Simulate navigation: Zustand store persists across component remounts
  const newStore = useCartStore.getState();
  expect(newStore.items).toHaveLength(1);
  expect(newStore.items[0].productId).toBe('p001');
});`,
  },
  {
    name: 'Quantity remains unchanged after navigation',
    description: 'Set quantity to 3, simulate remount, assert quantity still 3.',
    code: `test('quantity remains unchanged after navigation', () => {
  const store = useCartStore.getState();
  store.clearCart();
  store.addItem({ id: 'p001', name: 'Wireless Headphones', price: 79.99 }, 1);
  store.updateQuantity('p001', 3);
  // Re-read store (simulates component remount)
  const newStore = useCartStore.getState();
  expect(newStore.items[0].quantity).toBe(3);
});`,
  },
  {
    name: 'Multiple-item cart remains consistent',
    description: 'Add 3 different items, navigate, assert all 3 still present.',
    code: `test('multiple-item cart remains consistent after navigation', () => {
  const store = useCartStore.getState();
  store.clearCart();
  store.addItem({ id: 'p001', name: 'Headphones', price: 79.99 }, 2);
  store.addItem({ id: 'p002', name: 'Keyboard', price: 129.99 }, 1);
  store.addItem({ id: 'p003', name: 'USB-C Hub', price: 39.99 }, 3);
  const newStore = useCartStore.getState();
  expect(newStore.items).toHaveLength(3);
  const total = newStore.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  expect(total).toBeCloseTo(79.99*2 + 129.99 + 39.99*3, 2);
});`,
  },
  {
    name: 'Empty-cart behavior preserved',
    description: 'Empty cart must still show empty after remount — no phantom items.',
    code: `test('empty cart remains empty after navigation', () => {
  const store = useCartStore.getState();
  store.clearCart();
  // Re-read (simulates remount)
  const newStore = useCartStore.getState();
  expect(newStore.items).toHaveLength(0);
  const total = newStore.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  expect(total).toBe(0);
});`,
  },
  {
    name: 'Checkout state preserved until cleared',
    description: 'clearCart() must reset items and total — checkout flow test.',
    code: `test('checkout clears cart correctly', () => {
  const store = useCartStore.getState();
  store.addItem({ id: 'p001', name: 'Headphones', price: 79.99 }, 1);
  expect(store.items.length).toBeGreaterThan(0);
  store.clearCart();
  const newStore = useCartStore.getState();
  expect(newStore.items).toHaveLength(0);
});`,
  },
];
