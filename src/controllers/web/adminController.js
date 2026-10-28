const dbStore = require('../../services/dbStore');

// @desc    Admin Dashboard Overview
// @route   GET /admin
const renderDashboard = (req, res) => {
  const products = dbStore.data.products;
  const orders = dbStore.getAllOrders();
  const users = dbStore.getAllUsers();
  const categories = dbStore.getCategories();

  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;

  res.render('pages/admin/dashboard', {
    title: 'Bảng Điều Khiển Quản Trị | Atelier Accessories',
    stats: {
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders,
      totalProducts: products.length,
      totalUsers: users.length
    },
    recentOrders: orders.slice(0, 5),
    categories,
    currentPath: '/admin'
  });
};

// @desc    Admin Product Management
// @route   GET /admin/products
const renderProducts = (req, res) => {
  const { search, category, page = 1 } = req.query;
  const data = dbStore.getProducts({
    search,
    category,
    page: Number(page),
    limit: 10
  });
  const categories = dbStore.getCategories();

  res.render('pages/admin/products', {
    title: 'Quản Lý Sản Phẩm | Atelier Admin',
    products: data.products,
    pagination: data.pagination,
    categories,
    query: req.query,
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
  const categories = dbStore.getCategories();
  res.render('pages/admin/categories', {
    title: 'Quản Lý Danh Mục | Atelier Admin',
    categories,
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
  const users = dbStore.getAllUsers();
  res.render('pages/admin/users', {
    title: 'Quản Lý Người Dùng & Phân Quyền | Atelier Admin',
    users,
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
