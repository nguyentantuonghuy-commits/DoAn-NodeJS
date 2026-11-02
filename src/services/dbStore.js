              const fs = require('fs');
const path = require('path');
const initialData = require('./seedData');

const DATA_FILE = path.join(__dirname, '../data/store.json');

function removeVietnameseTones(str) {
  if (!str) return '';
  str = String(str).toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  return str.trim();
}

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
          users: (parsed.users && parsed.users.length ? parsed.users : [...initialData.users]).map(u => ({
            status: u.status || 'active',
            authProvider: u.authProvider || 'local',
            googleId: u.googleId || '',
            createdAt: u.createdAt || new Date(),
            ...u
          })),
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
  getCategories(options = {}) {
    // Support boolean flag getCategories(true/false) or options object { includeHidden: true/false }
    const includeHidden = (typeof options === 'boolean') ? options : (options.includeHidden !== false);

    let cats = this.data.categories.map(c => {
      // Calculate dynamic real-time itemCount from products
      const count = this.data.products.filter(p => 
        (p.category === c.id || p.category === c.slug || p.categorySlug === c.slug || p.categoryId === c.id)
      ).length;
      return {
        ...c,
        itemCount: count,
        isHidden: !!c.isHidden,
        order: Number(c.order) || 99
      };
    });

    if (!includeHidden) {
      cats = cats.filter(c => !c.isHidden);
    }

    return cats.sort((a, b) => a.order - b.order);
  }

  getCategoryBySlug(slug) {
    if (!slug) return null;
    const cat = this.data.categories.find(c => c.slug === slug);
    if (!cat) return null;
    const count = this.data.products.filter(p => 
      (p.category === cat.id || p.category === cat.slug || p.categorySlug === cat.slug || p.categoryId === cat.id)
    ).length;
    return { ...cat, itemCount: count, isHidden: !!cat.isHidden };
  }

  getCategoryById(id) {
    if (!id) return null;
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) return null;
    const count = this.data.products.filter(p => 
      (p.category === cat.id || p.category === cat.slug || p.categorySlug === cat.slug || p.categoryId === cat.id)
    ).length;
    return { ...cat, itemCount: count, isHidden: !!cat.isHidden };
  }

  createCategory(categoryData) {
    const rawSlug = categoryData.slug || removeVietnameseTones(categoryData.name || '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const newCategory = {
      id: `cat_${Date.now()}`,
      name: categoryData.name ? categoryData.name.trim() : 'Danh Mục Mới',
      slug: rawSlug || `danh-muc-${Date.now()}`,
      description: categoryData.description ? categoryData.description.trim() : '',
      image: categoryData.image ? categoryData.image.trim() : 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      icon: categoryData.icon ? categoryData.icon.trim() : 'tag',
      order: Number(categoryData.order) || (this.data.categories.length + 1),
      isHidden: categoryData.isHidden === true || categoryData.isHidden === 'true',
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

    const existing = this.data.categories[index];
    const newSlug = updateData.slug ? updateData.slug.trim() : (
      updateData.name ? removeVietnameseTones(updateData.name).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : existing.slug
    );

    const isHidden = updateData.isHidden !== undefined ? 
      (updateData.isHidden === true || updateData.isHidden === 'true') : 
      !!existing.isHidden;

    this.data.categories[index] = {
      ...existing,
      name: updateData.name !== undefined ? updateData.name.trim() : existing.name,
      slug: newSlug || existing.slug,
      description: updateData.description !== undefined ? updateData.description.trim() : existing.description,
      image: updateData.image !== undefined ? updateData.image.trim() : existing.image,
      icon: updateData.icon !== undefined ? updateData.icon.trim() : existing.icon,
      order: updateData.order !== undefined ? (Number(updateData.order) || 1) : existing.order,
      isHidden,
      updatedAt: new Date()
    };
    this.saveToFile();
    return this.data.categories[index];
  }

  toggleCategoryVisibility(id) {
    const index = this.data.categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.data.categories[index].isHidden = !this.data.categories[index].isHidden;
    this.data.categories[index].updatedAt = new Date();
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

  getProductsByCategoryId(id, slug) {
    if (!id && !slug) return [];
    const idLower = id ? id.toString().trim().toLowerCase() : '';
    const slugLower = slug ? slug.toString().trim().toLowerCase() : '';
    return this.data.products.filter(p => {
      const pCat = p.category ? p.category.toString().trim().toLowerCase() : '';
      const pCatId = p.categoryId ? p.categoryId.toString().trim().toLowerCase() : '';
      const pCatSlug = p.categorySlug ? p.categorySlug.toString().trim().toLowerCase() : '';
      return (idLower && (pCat === idLower || pCatId === idLower)) ||
             (slugLower && (pCat === slugLower || pCatSlug === slugLower));
    });
  }

  // --- PRODUCTS ---
  getProducts({ search, category, stockStatus, visibility, sort = 'newest', page = 1, limit = 12, priceMin, priceMax, isSale, isFeatured, includeHidden = false }) {
    let result = [...this.data.products];

    // Visibility filter (Default: hide hidden products for public customers)
    if (!includeHidden) {
      result = result.filter(p => !p.isHidden);
    } else if (visibility) {
      if (visibility === 'visible') {
        result = result.filter(p => !p.isHidden);
      } else if (visibility === 'hidden') {
        result = result.filter(p => p.isHidden === true);
      }
    }

    // Filter by Category
    if (category) {
      const catClean = category.toString().trim().toLowerCase();
      result = result.filter(p =>
        (p.category && p.category.toLowerCase() === catClean) ||
        (p.categorySlug && p.categorySlug.toLowerCase() === catClean) ||
        (p.categoryId && p.categoryId.toLowerCase() === catClean) ||
        (p.categoryName && p.categoryName.toLowerCase() === catClean)
      );
    }

    // Filter by Search keyword (Exact + Accent-insensitive for Vietnamese)
    if (search) {
      const rawQ = search.toLowerCase().trim();
      const normQ = removeVietnameseTones(search);
      result = result.filter(p => {
        const nameRaw = (p.name || '').toLowerCase();
        const nameNorm = removeVietnameseTones(p.name);
        const descRaw = (p.description || '').toLowerCase();
        const descNorm = removeVietnameseTones(p.description);
        const catRaw = (p.categoryName || '').toLowerCase();
        const catNorm = removeVietnameseTones(p.categoryName);
        const sku = (p.id || '').toLowerCase();

        return (
          sku.includes(rawQ) ||
          nameRaw.includes(rawQ) ||
          nameNorm.includes(normQ) ||
          descRaw.includes(rawQ) ||
          descNorm.includes(normQ) ||
          catRaw.includes(rawQ) ||
          catNorm.includes(normQ)
        );
      });
    }

    // Filter by Stock Status
    if (stockStatus) {
      if (stockStatus === 'in_stock') {
        result = result.filter(p => Number(p.stock) > 0);
      } else if (stockStatus === 'low_stock') {
        result = result.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 10);
      } else if (stockStatus === 'out_of_stock') {
        result = result.filter(p => Number(p.stock) <= 0);
      }
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
      case 'stock_asc':
        result.sort((a, b) => Number(a.stock) - Number(b.stock));
        break;
      case 'stock_desc':
        result.sort((a, b) => Number(b.stock) - Number(a.stock));
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
    let catObj = null;
    if (productData.category) {
      catObj = this.data.categories.find(c => c.id === productData.category || c.slug === productData.category);
    }

    const newProduct = {
      id: `prod_${Date.now()}`,
      rating: 5.0,
      reviewsCount: 0,
      soldCount: 0,
      isFeatured: false,
      isSale: false,
      isHidden: productData.isHidden !== undefined ? Boolean(productData.isHidden) : false,
      colors: [],
      images: [],
      highlights: [],
      specs: {},
      createdAt: new Date(),
      ...productData,
      isHidden: productData.isHidden !== undefined ? Boolean(productData.isHidden) : false,
      category: catObj ? catObj.id : (productData.category || 'cat_belts'),
      categorySlug: catObj ? catObj.slug : (productData.categorySlug || ''),
      categoryName: catObj ? catObj.name : (productData.categoryName || 'Phụ kiện'),
      price: Number(productData.price) || 0,
      originalPrice: Number(productData.originalPrice || productData.price) || 0,
      stock: Number(productData.stock) || 0,
      slug: productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    };

    if (productData.hasVariants && Array.isArray(productData.variants) && productData.variants.length > 0) {
      newProduct.hasVariants = true;
      newProduct.variants = productData.variants.map((v, i) => ({
        id: v.id || `var_${Date.now()}_${i}`,
        name: v.name || `Phân loại ${i + 1}`,
        color: v.color || '',
        price: Number(v.price) || 0,
        originalPrice: Number(v.originalPrice || v.price) || 0,
        stock: Number(v.stock) || 0,
        sku: v.sku || `${newProduct.id}-${i + 1}`,
        image: v.image || ''
      }));
      const validPrices = newProduct.variants.map(v => v.price).filter(p => p > 0);
      if (validPrices.length > 0) {
        newProduct.price = Math.min(...validPrices);
      }
      newProduct.stock = newProduct.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      newProduct.colors = newProduct.variants.map(v => ({
        name: v.name,
        hex: v.color || '#111827',
        image: v.image || ''
      }));
    } else {
      newProduct.hasVariants = false;
      newProduct.variants = [];
    }

    this.data.products.unshift(newProduct);
    this.saveToFile();
    return newProduct;
  }

  updateProduct(id, updateData) {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    let resolvedData = { ...updateData };
    if (updateData.category) {
      const catObj = this.data.categories.find(c => c.id === updateData.category || c.slug === updateData.category);
      if (catObj) {
        resolvedData.category = catObj.id;
        resolvedData.categorySlug = catObj.slug;
        resolvedData.categoryName = catObj.name;
      }
    }

    if (updateData.isHidden !== undefined) {
      resolvedData.isHidden = Boolean(updateData.isHidden);
    }

    if (updateData.hasVariants !== undefined) {
      resolvedData.hasVariants = Boolean(updateData.hasVariants);
      if (resolvedData.hasVariants && Array.isArray(updateData.variants) && updateData.variants.length > 0) {
        resolvedData.variants = updateData.variants.map((v, i) => ({
          id: v.id || `var_${Date.now()}_${i}`,
          name: v.name || `Phân loại ${i + 1}`,
          color: v.color || '',
          price: Number(v.price) || 0,
          originalPrice: Number(v.originalPrice || v.price) || 0,
          stock: Number(v.stock) || 0,
          sku: v.sku || `${id}-${i + 1}`,
          image: v.image || ''
        }));
        const validPrices = resolvedData.variants.map(v => v.price).filter(p => p > 0);
        if (validPrices.length > 0) {
          resolvedData.price = Math.min(...validPrices);
        }
        resolvedData.stock = resolvedData.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
        resolvedData.colors = resolvedData.variants.map(v => ({
          name: v.name,
          hex: v.color || '#111827',
          image: v.image || ''
        }));
      } else {
        resolvedData.hasVariants = false;
        resolvedData.variants = [];
      }
    }

    this.data.products[index] = { ...this.data.products[index], ...resolvedData };
    this.saveToFile();
    return this.data.products[index];
  }

  toggleProductVisibility(id) {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.data.products[index].isHidden = !this.data.products[index].isHidden;
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

  findUserByGoogleId(googleId) {
    if (!googleId) return null;
    return this.data.users.find(u => u.googleId === googleId);
  }

  createUser(userData) {
    const { generateInitialsAvatar } = require('../utils/avatarHelper');
    const defaultAvatar = generateInitialsAvatar(userData.name || 'User');
    const newUser = {
      id: userData.id || `user_${Date.now()}`,
      name: userData.name || 'Người Dùng Mới',
      email: userData.email ? userData.email.toLowerCase() : '',
      role: userData.role || 'user',
      status: userData.status || 'active',
      authProvider: userData.authProvider || 'local',
      googleId: userData.googleId || '',
      phone: userData.phone || '',
      address: userData.address || '',
      avatar: userData.avatar || defaultAvatar,
      emailVerified: !!userData.emailVerified,
      createdAt: userData.createdAt || new Date(),
      lastLogin: userData.lastLogin || null,
      ...userData
    };
    if (!newUser.avatar) {
      newUser.avatar = defaultAvatar;
    }
    this.data.users.unshift(newUser);
    this.saveToFile();
    return newUser;
  }

  updateUser(id, updateData) {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.data.users[index] = {
      ...this.data.users[index],
      ...updateData,
      updatedAt: new Date()
    };
    this.saveToFile();
    return this.data.users[index];
  }

  deleteUser(id) {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return { success: false, message: 'Không tìm thấy người dùng' };
    const deletedUser = this.data.users[index];

    // Safe detach from existing orders (orders retain customerName/customerEmail/customerPhone)
    let detachedOrdersCount = 0;
    this.data.orders.forEach(order => {
      if (order.userId === id) {
        order.userId = null;
        detachedOrdersCount++;
      }
    });

    this.data.users.splice(index, 1);
    this.saveToFile();
    return { success: true, user: deletedUser, detachedOrdersCount };
  }

  toggleUserStatus(id) {
    const user = this.findUserById(id);
    if (!user) return null;
    user.status = user.status === 'locked' ? 'active' : 'locked';
    user.updatedAt = new Date();
    this.saveToFile();
    return user;
  }

  getUserStats() {
    const users = this.data.users || [];
    const total = users.length;
    const customers = users.filter(u => u.role === 'user').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const googleUsers = users.filter(u => u.authProvider === 'google' || !!u.googleId).length;
    const lockedUsers = users.filter(u => u.status === 'locked').length;
    const activeUsers = users.filter(u => u.status !== 'locked').length;
    return {
      total,
      customers,
      admins,
      googleUsers,
      lockedUsers,
      activeUsers
    };
  }

  getAllUsers(options = {}) {
    const { search, role, status, authProvider } = options;
    let list = this.data.users.map(({ password, ...rest }) => ({
      status: 'active',
      authProvider: 'local',
      googleId: '',
      ...rest
    }));

    if (search && search.trim()) {
      const q = removeVietnameseTones(search.toLowerCase());
      list = list.filter(u => {
        const name = removeVietnameseTones(u.name || '');
        const email = (u.email || '').toLowerCase();
        const phone = (u.phone || '').replace(/[^\d]/g, '');
        return name.includes(q) || email.includes(q) || phone.includes(q);
      });
    }

    if (role && role !== 'all') {
      list = list.filter(u => u.role === role);
    }

    if (status && status !== 'all') {
      list = list.filter(u => u.status === status);
    }

    if (authProvider && authProvider !== 'all') {
      list = list.filter(u => (u.authProvider || 'local') === authProvider);
    }

    // Attach order count & total spend for each user for deep CRM visibility
    return list.map(u => {
      const userOrders = this.data.orders.filter(o => o.userId === u.id || (u.email && o.customerEmail && o.customerEmail.toLowerCase() === u.email.toLowerCase()));
      const validOrders = userOrders.filter(o => o.orderStatus !== 'cancelled');
      const totalSpent = validOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
      return {
        ...u,
        ordersCount: userOrders.length,
        totalSpent
      };
    });
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

    // Only allow cancelling if still pending for customers
    if (userId && order.orderStatus !== 'pending') {
      return { success: false, message: 'Khách hàng chỉ có thể hủy đơn khi đang ở trạng thái Chờ xác nhận' };
    }

    // Admin cannot cancel already completed orders
    if (!userId && order.orderStatus === 'completed') {
      return { success: false, message: 'Không thể hủy đơn hàng đã hoàn tất giao hàng thành công' };
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

