const dbStore = require('../../services/dbStore');
const { getMembershipTier } = require('../../utils/membershipHelper');

// @desc    Admin Dashboard Overview with Comprehensive Real-time Analytics
// @route   GET /admin
const renderDashboard = (req, res) => {
  const products = dbStore.data.products || [];
  const orders = dbStore.getAllOrders() || [];
  const users = dbStore.getAllUsers() || [];
  const categories = dbStore.getCategories() || [];

  // 1. Core Financial & Operational KPIs
  const validOrders = orders.filter(o => o.orderStatus !== 'cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.orderStatus === 'completed').length;
  const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;
  const shippingOrders = orders.filter(o => o.orderStatus === 'shipping').length;
  const confirmedOrders = orders.filter(o => o.orderStatus === 'confirmed').length;
  const cancelledOrders = orders.filter(o => o.orderStatus === 'cancelled').length;

  const aov = validOrders.length ? Math.round(totalRevenue / validOrders.length) : 0;
  const fulfillmentRate = validOrders.length ? Math.round((completedOrders / validOrders.length) * 100) : 0;

  let totalItemsSold = 0;
  validOrders.forEach(o => {
    (o.items || []).forEach(it => {
      totalItemsSold += (Number(it.quantity) || 1);
    });
  });

  const avgItemsPerOrder = validOrders.length ? (totalItemsSold / validOrders.length).toFixed(1) : '0';
  const validOrdersCount = validOrders.length;
  const paidOrders = validOrders.filter(o => o.paymentStatus === 'paid');
  const paidRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const paidRate = totalRevenue > 0 ? Math.round((paidRevenue / totalRevenue) * 100) : 0;

  const totalStock = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const lowStockThreshold = 35;
  const lowStockProducts = products.filter(p => Number(p.stock) <= lowStockThreshold);
  const outOfStockProducts = products.filter(p => Number(p.stock) <= 0);

  // 2. Timeline Analytics (Daily Revenue & Order Trends)
  const dailyMap = {};
  orders
    .slice()
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .forEach(o => {
      const d = new Date(o.createdAt);
      const dayKey = (d.getDate() < 10 ? '0' : '') + d.getDate() + '/' + (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1);
      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = { revenue: 0, orders: 0 };
      }
      dailyMap[dayKey].orders += 1;
      if (o.orderStatus !== 'cancelled') {
        dailyMap[dayKey].revenue += (Number(o.totalAmount) || 0);
      }
    });

  const timelineLabels = Object.keys(dailyMap);
  const timelineRevenue = timelineLabels.map(k => dailyMap[k].revenue);
  const timelineOrders = timelineLabels.map(k => dailyMap[k].orders);

  // 3. Category Revenue & Sales Distribution
  const catStatsMap = {};
  categories.forEach(c => {
    catStatsMap[c.id] = { id: c.id, name: c.name, revenue: 0, count: 0 };
  });

  validOrders.forEach(o => {
    (o.items || []).forEach(it => {
      const prod = products.find(p => p.id === it.productId);
      const catId = prod ? prod.category : null;
      if (catId && catStatsMap[catId]) {
        catStatsMap[catId].revenue += (Number(it.price) * (Number(it.quantity) || 1));
        catStatsMap[catId].count += (Number(it.quantity) || 1);
      }
    });
  });

  const categoryLabels = Object.values(catStatsMap).map(c => c.name);
  const categoryRevenues = Object.values(catStatsMap).map(c => c.revenue);
  const categoryColors = ['#D97706', '#2563EB', '#059669', '#7C3AED', '#DC2626', '#EA580C'];

  // 4. Payment Gateway Breakdown
  const paymentMap = {
    cod: { label: 'COD (Tiền Mặt)', count: 0, amount: 0, color: '#3B82F6' },
    vnpay: { label: 'Ví VNPAY QR', count: 0, amount: 0, color: '#059669' },
    momo: { label: 'Ví MoMo', count: 0, amount: 0, color: '#EC4899' },
    bank_transfer: { label: 'Chuyển Khoản Ngân Hàng', count: 0, amount: 0, color: '#D97706' }
  };

  orders.forEach(o => {
    const method = o.paymentMethod || 'cod';
    if (!paymentMap[method]) {
      paymentMap[method] = { label: method, count: 0, amount: 0, color: '#64748B' };
    }
    paymentMap[method].count += 1;
    if (o.orderStatus !== 'cancelled') {
      paymentMap[method].amount += (Number(o.totalAmount) || 0);
    }
  });

  // 5. Order Status Summary
  const orderStatusSummary = {
    pending: { label: 'Chờ Xác Nhận', count: pendingOrders, color: '#F59E0B' },
    confirmed: { label: 'Đã Xác Nhận', count: confirmedOrders, color: '#3B82F6' },
    shipping: { label: 'Đang Vận Chuyển', count: shippingOrders, color: '#6366F1' },
    completed: { label: 'Đã Hoàn Thành', count: completedOrders, color: '#10B981' },
    cancelled: { label: 'Đã Hủy Đơn', count: cancelledOrders, color: '#EF4444' }
  };

  // 6. Top-Selling Products (Bestsellers Ranking)
  const productSalesMap = {};
  validOrders.forEach(o => {
    (o.items || []).forEach(it => {
      const pid = it.productId;
      if (!productSalesMap[pid]) {
        productSalesMap[pid] = {
          id: pid,
          name: it.productName,
          image: it.image,
          price: it.price,
          quantitySold: 0,
          totalRevenue: 0
        };
      }
      const qty = Number(it.quantity) || 1;
      productSalesMap[pid].quantitySold += qty;
      productSalesMap[pid].totalRevenue += (Number(it.price) * qty);
    });
  });

  const topProducts = Object.values(productSalesMap)
    .map(sp => {
      const matched = products.find(p => p.id === sp.id);
      const cat = matched ? categories.find(c => c.id === matched.category) : null;
      return {
        ...sp,
        stock: matched ? matched.stock : 0,
        categoryName: cat ? cat.name : 'Phụ Kiện',
        rating: matched ? matched.rating : 5
      };
    })
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5);

  // 7. Inventory Watchlist (Lowest Stock Products)
  const inventoryWatchlist = products
    .slice()
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)
    .map(p => {
      const cat = categories.find(c => c.id === p.category);
      return {
        id: p.id,
        name: p.name,
        categoryName: cat ? cat.name : 'Phụ Kiện',
        stock: p.stock,
        price: p.price,
        image: p.image || (p.images && p.images[0]),
        status: p.stock <= 0 ? 'Hết hàng' : (p.stock <= 30 ? 'Cảnh báo sắp hết' : 'Tồn kho ổn định'),
        badgeClass: p.stock <= 0 ? 'badge-soft-red' : (p.stock <= 30 ? 'badge-soft-amber' : 'badge-soft-green')
      };
    });

  // 8. Customer Loyalty Tiers Breakdown
  const loyaltyCounts = { new: 0, silver: 0, gold: 0, vip: 0, admin: 0 };
  users.forEach(u => {
    const userOrders = dbStore.getOrdersByUserId(u.id);
    const tier = getMembershipTier(u, userOrders);
    if (tier && loyaltyCounts[tier.level] !== undefined) {
      loyaltyCounts[tier.level] += 1;
    }
  });

  // 9. Recent Orders
  const recentOrders = orders.slice(0, 6);

  res.render('pages/admin/dashboard', {
    title: 'Bảng Điều Khiển Quản Trị Hệ Thống | Atelier Admin',
    stats: {
      totalRevenue,
      validOrdersCount,
      totalOrders,
      completedOrders,
      pendingOrders,
      shippingOrders,
      confirmedOrders,
      cancelledOrders,
      aov,
      fulfillmentRate,
      totalItemsSold,
      avgItemsPerOrder,
      paidRevenue,
      paidRate,
      totalProducts: products.length,
      totalStock,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      totalUsers: users.length,
      totalCustomers: users.filter(u => u.role === 'user').length
    },
    analytics: {
      timelineLabels: JSON.stringify(timelineLabels),
      timelineRevenue: JSON.stringify(timelineRevenue),
      timelineOrders: JSON.stringify(timelineOrders),
      categoryLabels: JSON.stringify(categoryLabels),
      categoryRevenues: JSON.stringify(categoryRevenues),
      categoryColors: JSON.stringify(categoryColors),
      paymentMap,
      paymentLabels: JSON.stringify(Object.values(paymentMap).map(p => p.label)),
      paymentCounts: JSON.stringify(Object.values(paymentMap).map(p => p.count)),
      paymentColors: JSON.stringify(Object.values(paymentMap).map(p => p.color)),
      orderStatusSummary,
      orderStatusLabels: JSON.stringify(Object.values(orderStatusSummary).map(s => s.label)),
      orderStatusCounts: JSON.stringify(Object.values(orderStatusSummary).map(s => s.count)),
      orderStatusColors: JSON.stringify(Object.values(orderStatusSummary).map(s => s.color)),
      loyaltyCounts
    },
    topProducts,
    inventoryWatchlist,
    recentOrders,
    categories,
    currentPath: '/admin'
  });
};

// @desc    Admin Product Management
// @route   GET /admin/products
const renderProducts = (req, res) => {
  const { search, category, stockStatus, visibility, sort = 'newest', page = 1 } = req.query;
  const data = dbStore.getProducts({
    search,
    category,
    stockStatus,
    visibility,
    includeHidden: true,
    sort,
    page: Number(page),
    limit: 50
  });
  const categories = dbStore.getCategories();
  const allProducts = dbStore.data.products;
  const totalStock = allProducts.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const lowStockCount = allProducts.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 10).length;
  const outOfStockCount = allProducts.filter(p => Number(p.stock) <= 0).length;
  const hiddenCount = allProducts.filter(p => p.isHidden === true).length;
  const activeCount = allProducts.filter(p => !p.isHidden).length;

  res.render('pages/admin/products', {
    title: 'Quản Lý Sản Phẩm | Atelier Admin',
    products: data.products,
    pagination: data.pagination,
    categories,
    query: req.query,
    stats: {
      totalProducts: allProducts.length,
      activeCount,
      totalStock,
      lowStockCount,
      outOfStockCount,
      hiddenCount
    },
    currentPath: '/admin/products'
  });
};

// @desc    Admin New Product Form
// @route   GET /admin/products/new
const renderNewProduct = (req, res) => {
  const categories = dbStore.getCategories();
  res.render('pages/admin/product-form', {
    title: 'Thêm Mới Sản Phẩm | Atelier Admin',
    categories,
    product: null,
    isEdit: false,
    currentPath: '/admin/products'
  });
};

// @desc    Admin Edit Product Form
// @route   GET /admin/products/edit/:id
const renderEditProduct = (req, res) => {
  const { id } = req.params;
  const product = dbStore.getProductById(id);
  if (!product) return res.redirect('/admin/products');

  const categories = dbStore.getCategories();
  res.render('pages/admin/product-form', {
    title: `Chỉnh Sửa Sản Phẩm: ${product.name} | Atelier Admin`,
    categories,
    product,
    isEdit: true,
    currentPath: '/admin/products'
  });
};

// @desc    Admin Category Management
// @route   GET /admin/categories
const renderCategories = (req, res) => {
  const categories = dbStore.getCategories(true); // include all categories for admin
  const totalCategories = categories.length;
  const activeCount = categories.filter(c => !c.isHidden).length;
  const hiddenCount = categories.filter(c => c.isHidden).length;
  const totalProducts = dbStore.data.products.length;

  res.render('pages/admin/categories', {
    title: 'Quản Lý Danh Mục Phụ Kiện | Atelier Admin',
    categories,
    stats: {
      totalCategories,
      activeCount,
      hiddenCount,
      totalProducts
    },
    currentPath: '/admin/categories'
  });
};

// @desc    Admin Order Management
// @route   GET /admin/orders
const renderOrders = (req, res) => {
  const orders = dbStore.getAllOrders();
  res.render('pages/admin/orders', {
    title: 'Quản Lý Đơn Hàng | Atelier Admin',
    orders,
    currentPath: '/admin/orders'
  });
};

// @desc    Admin User Management
// @route   GET /admin/users
const renderUsers = (req, res) => {
  const { search, role, status, authProvider } = req.query;
  const users = dbStore.getAllUsers({ search, role, status, authProvider });
  const stats = dbStore.getUserStats();

  res.render('pages/admin/users', {
    title: 'Quản Lý Người Dùng & Phân Quyền | Atelier Admin',
    users,
    stats,
    query: req.query,
    currentPath: '/admin/users'
  });
};

module.exports = {
  renderDashboard,
  renderProducts,
  renderNewProduct,
  renderEditProduct,
  renderCategories,
  renderOrders,
  renderUsers
};
