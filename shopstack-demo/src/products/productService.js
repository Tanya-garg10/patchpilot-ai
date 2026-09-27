// ShopStack — Product Service
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

module.exports = { getAllProducts, getProductById, searchProducts };
