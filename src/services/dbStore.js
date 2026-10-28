const fs = require('fs');
const path = require('path');
const initialData = require('./seedData');

const DATA_FILE = path.join(__dirname, '../data/store.json');

// Initialize Store
class DBStore {
  constructor() {
    this.data = {
      categories: [...initialData.categories],
      products: [...initialData.products],
      users: [...initialData.users],
      orders: [...initialData.orders],
      reviews: [...initialData.reviews],
      blogs: [...(initialData.blogs || [])],
      stores: [...(initialData.stores || [])]
    };
    this.loadFromFile();
  }

  loadFromFile() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          ...parsed,
          blogs: parsed.blogs && parsed.blogs.length ? parsed.blogs : [...(initialData.blogs || [])],
          stores: parsed.stores && parsed.stores.length ? parsed.stores : [...(initialData.stores || [])]
        };
      } else {
        this.saveToFile();
      }
    } catch (e) {
      console.warn('[DBStore] Error reading file, using initial data:', e.message);
      this.saveToFile();
    }
  }

  saveToFile() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[DBStore] Error writing data file:', e.message);
    }
  }

  // --- CATEGORIES ---
  getCategories() {
    return this.data.categories.sort((a, b) => a.order - b.order);
  }

  getCategoryBySlug(slug) {
    return this.data.categories.find(c => c.slug === slug);
  }

  getCategoryById(id) {
    return this.data.categories.find(c => c.id === id);
  }

  createCategory(categoryData) {
    const newCategory = {
      id: `cat_${Date.now()}`,
      ...categoryData,
      slug: categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      itemCount: 0,
      createdAt: new Date()
    };
    this.data.categories.push(newCategory);
    this.saveToFile();
    return newCategory;
  }

  updateCategory(id, updateData) {
    const index = this.data.categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.data.categories[index] = { ...this.data.categories[index], ...updateData };
    this.saveToFile();
    return this.data.categories[index];
  }

  deleteCategory(id) {
    const index = this.data.categories.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.data.categories.splice(index, 1);
    this.saveToFile();
    return true;
  }

  // --- PRODUCTS ---
  getProducts({ search, category, sort = 'newest', page = 1, limit = 12, priceMin, priceMax, isSale, isFeatured }) {
    let result = [...this.data.products];

    // Filter by Category
    if (category) {
      result = result.filter(p => p.category === category || p.categorySlug === category);
    }

    // Filter by Search keyword
    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q))
      );
    }

    // Filter by Price range
    if (priceMin !== undefined && !isNaN(priceMin)) {
      result = result.filter(p => p.price >= Number(priceMin));
    }
    if (priceMax !== undefined && !isNaN(priceMax)) {
      result = result.filter(p => p.price <= Number(priceMax));
    }

    // Filter by Sale or Featured
    if (isSale) {
      result = result.filter(p => p.isSale);
    }
    if (isFeatured) {
      result = result.filter(p => p.isFeatured);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
      case 'best_seller':
        result.sort((a, b) => b.soldCount - a.soldCount);
        break;
      case 'newest':
      default:
        // By default newest or featured first
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    const total = result.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const currentPage = Math.max(1, Math.min(Number(page) || 1, totalPages));
    const startIndex = (currentPage - 1) * limit;
    const paginatedProducts = result.slice(startIndex, startIndex + limit);

    return {
      products: paginatedProducts,
      pagination: {
        total,
        page: currentPage,
        limit: Number(limit),
        totalPages
      }
    };
  }

  getProductById(id) {
    return this.data.products.find(p => p.id === id);
  }

  getProductBySlug(slug) {
    return this.data.products.find(p => p.slug === slug);
  }

  createProduct(productData) {
    const newProduct = {
      id: `prod_${Date.now()}`,
      rating: 5.0,
      reviewsCount: 0,
      soldCount: 0,
      isFeatured: false,
      isSale: false,
      colors: [],
      images: [],
      highlights: [],
      specs: {},
      createdAt: new Date(),
      ...productData,
      price: Number(productData.price) || 0,
      originalPrice: Number(productData.originalPrice || productData.price) || 0,
      stock: Number(productData.stock) || 0,
      slug: productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    };
    this.data.products.unshift(newProduct);
    this.saveToFile();
    return newProduct;
  }

  updateProduct(id, updateData) {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.data.products[index] = { ...this.data.products[index], ...updateData };
    this.saveToFile();
    return this.data.products[index];
  }

  deleteProduct(id) {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.data.products.splice(index, 1);
    this.saveToFile();
    return true;
  }

  // --- USERS ---
  findUserByEmail(email) {
    if (!email) return null;
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  createUser(userData) {
    const newUser = {
      id: `user_${Date.now()}`,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date(),
      ...userData
    };
    this.data.users.push(newUser);
    this.saveToFile();
    return newUser;
  }

  updateUser(id, updateData) {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.data.users[index] = { ...this.data.users[index], ...updateData };
    this.saveToFile();
    return this.data.users[index];
  }

  getAllUsers() {
    return this.data.users.map(({ password, ...rest }) => rest);
  }

  // --- ORDERS ---
  getAllOrders() {
    return [...this.data.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getOrdersByUserId(userId) {
    return this.data.orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getOrderById(id) {
    return this.data.orders.find(o => o.id === id || o.orderCode === id);
  }

  createOrder(orderData) {
    const newOrder = {
      id: `ord_${Date.now()}`,
      orderCode: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      paymentStatus: 'unpaid',
      orderStatus: 'pending',
      shippingFee: 0,
      discountAmount: 0,
      createdAt: new Date(),
      ...orderData
    };
    this.data.orders.unshift(newOrder);
    this.saveToFile();
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.data.orders.find(o => o.id === orderId || o.orderCode === orderId);
    if (!order) return null;
    order.orderStatus = newStatus;
    if (newStatus === 'completed') {
      order.paymentStatus = 'paid';
    }
    this.saveToFile();
    return order;
  }

  cancelOrder(orderId, userId = null) {
    const order = this.data.orders.find(o => o.id === orderId || o.orderCode === orderId);
    if (!order) return { success: false, message: 'Không tìm thấy đơn hàng' };

    // If regular user, ensure they own the order
    if (userId && order.userId !== userId) {
      return { success: false, message: 'Bạn không có quyền hủy đơn hàng này' };
    }

    // Only allow cancelling if still pending
    if (order.orderStatus !== 'pending') {
      return { success: false, message: 'Chỉ có thể hủy đơn hàng khi đang ở trạng thái Chờ xác nhận' };
    }

    order.orderStatus = 'cancelled';
    this.saveToFile();
    return { success: true, order };
  }

  // --- REVIEWS ---
  getReviewsByProductId(productId) {
    return this.data.reviews.filter(r => r.productId === productId);
  }

  createReview(reviewData) {
    const newReview = {
      id: `rev_${Date.now()}`,
      isVerified: true,
      createdAt: new Date(),
      ...reviewData
    };
    this.data.reviews.unshift(newReview);

    // Update product rating and reviewsCount
    const prodReviews = this.data.reviews.filter(r => r.productId === reviewData.productId);
    const avgRating = prodReviews.reduce((sum, r) => sum + Number(r.rating), 0) / prodReviews.length;
    const prod = this.getProductById(reviewData.productId);
    if (prod) {
      prod.rating = parseFloat(avgRating.toFixed(1));
      prod.reviewsCount = prodReviews.length;
    }

    this.saveToFile();
    return newReview;
  }

  // --- BLOGS ---
  getBlogPosts() {
    return this.data.blogs || [];
  }

  getBlogPostBySlug(slug) {
    return (this.data.blogs || []).find(b => b.slug === slug || b.id === slug);
  }

  // --- STORES ---
  getStores() {
    return this.data.stores || [];
  }
}

// Export singleton instance
const dbStore = new DBStore();
module.exports = dbStore;

