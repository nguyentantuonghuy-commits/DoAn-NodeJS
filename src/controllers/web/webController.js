const dbStore = require('../../services/dbStore');

// @desc    Render Homepage
// @route   GET /
const renderHome = (req, res) => {
  const categories = dbStore.getCategories();
  const flashSaleData = dbStore.getProducts({ isSale: true, limit: 4 });
  const featuredData = dbStore.getProducts({ isFeatured: true, limit: 8 });
  const bestSellersData = dbStore.getProducts({ sort: 'best_seller', limit: 8 });
  const reviews = dbStore.data.reviews.slice(0, 3);

  res.render('pages/home', {
    title: 'Atelier Accessories | Đẳng Cấp Phụ Kiện Thời Trang Đương Đại',
    categories,
    flashSaleProducts: flashSaleData.products,
    featuredProducts: featuredData.products,
    bestSellerProducts: bestSellersData.products,
    reviews,
    currentPath: '/'
  });
};

// @desc    Render Catalog / Shop Page with Search & Filters
// @route   GET /shop
const renderShop = (req, res) => {
  const { search, category, sort = 'newest', page = 1, priceMin, priceMax, isSale } = req.query;

  const categories = dbStore.getCategories();
  const activeCategory = category ? dbStore.getCategoryBySlug(category) || dbStore.getCategoryById(category) : null;

  const data = dbStore.getProducts({
    search,
    category: activeCategory ? activeCategory.id : null,
    sort,
    page: Number(page),
    limit: 12,
    priceMin,
    priceMax,
    isSale: isSale === 'true'
  });

  res.render('pages/shop', {
    title: activeCategory ? `${activeCategory.name} | Atelier Accessories` : 'Tất Cả Phụ Kiện Thời Trang | Atelier Accessories',
    products: data.products,
    pagination: data.pagination,
    categories,
    activeCategory,
    query: req.query,
    currentPath: '/shop'
  });
};

// @desc    Render Product Detail Page
// @route   GET /product/:slug
const renderProductDetail = (req, res) => {
  const { slug } = req.params;
  const product = dbStore.getProductBySlug(slug) || dbStore.getProductById(slug);

  if (!product) {
    return res.status(404).render('pages/404', {
      title: 'Không Tìm Thấy Sản Phẩm | Atelier Accessories',
      message: 'Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh.'
    });
  }

  const category = dbStore.getCategoryById(product.category) || dbStore.getCategoryBySlug(product.category);
  const reviews = dbStore.getReviewsByProductId(product.id);
  const relatedProducts = dbStore.getProducts({ category: product.category, limit: 4 }).products.filter(p => p.id !== product.id);

  res.render('pages/product-detail', {
    title: `${product.name} | Atelier Accessories`,
    product,
    category,
    reviews,
    relatedProducts,
    currentPath: '/shop'
  });
};

// @desc    Render Cart Page
// @route   GET /cart
const renderCart = (req, res) => {
  res.render('pages/cart', {
    title: 'Giỏ Hàng Của Bạn | Atelier Accessories',
    currentPath: '/cart'
  });
};

// @desc    Render Checkout Page
// @route   GET /checkout
const renderCheckout = (req, res) => {
  res.render('pages/checkout', {
    title: 'Thanh Toán Đơn Hàng | Atelier Accessories',
    currentPath: '/checkout'
  });
};

// @desc    Render Order Success
// @route   GET /order-success
const renderOrderSuccess = (req, res) => {
  const { orderCode } = req.query;
  const order = dbStore.getOrderById(orderCode);

  res.render('pages/order-success', {
    title: 'Đặt Hàng Thành Công | Atelier Accessories',
    order,
    orderCode
  });
};

// @desc    Render Login Page
// @route   GET /login
const renderLogin = (req, res) => {
  if (req.user) return res.redirect('/profile');
  res.render('pages/auth/login', {
    title: 'Đăng Nhập | Atelier Accessories',
    currentPath: '/login'
  });
};

// @desc    Render Register Page
// @route   GET /register
const renderRegister = (req, res) => {
  if (req.user) return res.redirect('/profile');
  res.render('pages/auth/register', {
    title: 'Tạo Tài Khoản Mới | Atelier Accessories',
    currentPath: '/register'
  });
};

// @desc    Render User Profile & Order History
// @route   GET /profile
const renderProfile = (req, res) => {
  const orders = dbStore.getOrdersByUserId(req.user.id);
  res.render('pages/profile', {
    title: 'Hồ Sơ Của Tôi | Atelier Accessories',
    user: req.user,
    orders,
    currentPath: '/profile'
  });
};

// @desc    Logout Web SSR
// @route   GET /logout
const logoutWeb = (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
};

module.exports = {
  renderHome,
  renderShop,
  renderProductDetail,
  renderCart,
  renderCheckout,
  renderOrderSuccess,
  renderLogin,
  renderRegister,
  renderProfile,
  logoutWeb
};
