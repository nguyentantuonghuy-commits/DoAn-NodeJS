const dbStore = require('../../services/dbStore');

// @desc    Render Homepage
// @route   GET /
const renderHome = (req, res) => {
  const categories = dbStore.getCategories(false);
  const flashSaleData = dbStore.getProducts({ isSale: true, limit: 4 });
  const featuredData = dbStore.getProducts({ isFeatured: true, limit: 8 });
  const bestSellersData = dbStore.getProducts({ sort: 'best_seller', limit: 8 });
  const newArrivalsData = dbStore.getProducts({ sort: 'newest', limit: 8 });
  const reviews = dbStore.data.reviews ? dbStore.data.reviews.slice(0, 4) : [];

  res.render('pages/home', {
    title: 'Atelier Accessories | Đẳng Cấp Phụ Kiện Thời Trang Đương Đại',
    categories,
    flashSaleProducts: flashSaleData.products,
    featuredProducts: featuredData.products,
    bestSellerProducts: bestSellersData.products,
    newArrivalProducts: newArrivalsData.products,
    reviews,
    currentPath: '/',
    query: req.query
  });
};

// @desc    Render Catalog / Shop Page with Search & Filters
// @route   GET /shop
const renderShop = (req, res) => {
  const { search, category, sort = 'newest', page = 1, priceMin, priceMax, isSale } = req.query;

  const categories = dbStore.getCategories(false);
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

  if (!product || (product.isHidden && (!req.user || req.user.role !== 'admin'))) {
    return res.status(404).render('pages/404', {
      title: 'Không Tìm Thấy Sản Phẩm | Atelier Accessories',
      message: 'Sản phẩm bạn đang tìm kiếm hiện đang tạm ẩn hoặc đã ngừng kinh doanh.'
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

// @desc    Render Track Order Page (Public)
// @route   GET /track-order
const renderTrackOrder = (req, res) => {
  try {
    const { code, phone, query } = req.query;
    const initialQuery = code || phone || query || '';

    let initialOrder = null;
    if (initialQuery) {
      const allOrders = dbStore.getAllOrders();
      const cleanQ = initialQuery.toLowerCase().replace(/\s+/g, '');
      const digits = cleanQ.replace(/[^\d]/g, '');

      initialOrder = allOrders.find(o => 
        (o.orderCode && o.orderCode.toLowerCase() === cleanQ) ||
        (o.id && o.id.toLowerCase() === cleanQ)
      );

      // If not matched by code, try by phone
      if (!initialOrder && digits.length >= 8) {
        initialOrder = allOrders.find(o => {
          if (!o.customerPhone) return false;
          const p = o.customerPhone.replace(/[^\d]/g, '');
          return p === digits || p.endsWith(digits) || digits.endsWith(p);
        });
      }
    }

    res.render('pages/track-order', {
      title: 'Tra Cứu Đơn Hàng | Atelier Accessories',
      currentPath: '/track-order',
      initialQuery,
      initialOrder
    });
  } catch (error) {
    console.error('Error rendering track order page:', error);
    res.status(500).render('pages/404', {
      title: 'Lỗi Tra Cứu Đơn Hàng',
      message: 'Đã xảy ra lỗi khi tải trang tra cứu đơn hàng.'
    });
  }
};

// @desc    Render Login Page
// @route   GET /login
const renderLogin = (req, res) => {
  if (req.user) return res.redirect('/profile');
  let errorMessage = null;
  if (req.query.locked) {
    errorMessage = 'Tài khoản của bạn đã bị khóa bởi Quản trị viên. Vui lòng liên hệ bộ phận hỗ trợ.';
  } else if (req.query.error) {
    errorMessage = decodeURIComponent(req.query.error);
  }
  res.render('pages/auth/login', {
    title: 'Đăng Nhập | Atelier Accessories',
    errorMessage,
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    currentPath: '/login'
  });
};

// @desc    Render Register Page
// @route   GET /register
const renderRegister = (req, res) => {
  if (req.user) return res.redirect('/profile');
  let errorMessage = null;
  if (req.query.error) {
    errorMessage = decodeURIComponent(req.query.error);
  }
  res.render('pages/auth/register', {
    title: 'Tạo Tài Khoản Mới | Atelier Accessories',
    errorMessage,
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    currentPath: '/register'
  });
};

// @desc    Render Forgot Password Page
// @route   GET /forgot-password
const renderForgotPassword = (req, res) => {
  if (req.user) return res.redirect('/profile');
  res.render('pages/auth/forgot-password', {
    title: 'Khôi Phục Mật Khẩu | Atelier Accessories',
    currentPath: '/forgot-password'
  });
};

// @desc    Render User Profile & Order History
// @route   GET /profile
const renderProfile = (req, res) => {
  const { getMembershipTier } = require('../../utils/membershipHelper');
  const orders = dbStore.getOrdersByUserId(req.user.id);
  const membershipTier = getMembershipTier(req.user, orders);
  res.render('pages/profile', {
    title: 'Hồ Sơ Của Tôi | Atelier Accessories',
    user: req.user,
    orders,
    membershipTier,
    currentPath: '/profile'
  });
};

// @desc    Logout Web SSR
// @route   GET /logout
const logoutWeb = (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
};

// @desc    Render About Page
// @route   GET /about
const renderAbout = (req, res) => {
  res.render('pages/about', {
    title: 'Về Atelier Accessories | Câu Chuyện Thương Hiệu & Di Sản Chế Tác',
    currentPath: '/about'
  });
};

// @desc    Render Contact & Stores Page
// @route   GET /contact
const renderContact = (req, res) => {
  const stores = dbStore.getStores();
  res.render('pages/contact', {
    title: 'Hệ Thống Cửa Hàng & Liên Hệ | Atelier Accessories',
    stores,
    currentPath: '/contact'
  });
};

// @desc    Render Fashion Journal / Blog Page
// @route   GET /blog
const renderBlog = (req, res) => {
  const blogs = dbStore.getBlogPosts();
  res.render('pages/blog', {
    title: 'Tạp Chí Thời Trang & Mẹo Phối Đồ | Atelier Journal',
    blogs,
    currentPath: '/blog'
  });
};

// @desc    Render Blog Detail Page
// @route   GET /blog/:slug
const renderBlogDetail = (req, res) => {
  const { slug } = req.params;
  const blog = dbStore.getBlogPostBySlug(slug);
  if (!blog) {
    return res.status(404).render('pages/404', {
      title: 'Không Tìm Thấy Bài Viết | Atelier Journal',
      message: 'Bài viết bạn đang tìm không tồn tại hoặc đã bị gỡ bỏ.'
    });
  }
  const relatedBlogs = dbStore.getBlogPosts().filter(b => b.slug !== slug).slice(0, 2);
  const featuredProducts = dbStore.getProducts({ isFeatured: true, limit: 3 }).products;

  res.render('pages/blog-detail', {
    title: `${blog.title} | Atelier Journal`,
    blog,
    relatedBlogs,
    featuredProducts,
    currentPath: '/blog'
  });
};

// @desc    Render Lookbook Page
// @route   GET /lookbook
const renderLookbook = (req, res) => {
  const featuredProducts = dbStore.getProducts({ isFeatured: true, limit: 6 }).products;
  res.render('pages/lookbook', {
    title: 'Bộ Sưu Tập Lookbook Thu Đông 2026 | Atelier Style',
    featuredProducts,
    currentPath: '/lookbook'
  });
};

module.exports = {
  renderHome,
  renderShop,
  renderProductDetail,
  renderCart,
  renderCheckout,
  renderOrderSuccess,
  renderTrackOrder,
  renderLogin,
  renderRegister,
  renderForgotPassword,
  renderProfile,
  renderAbout,
  renderContact,
  renderBlog,
  renderBlogDetail,
  renderLookbook,
  logoutWeb
};

