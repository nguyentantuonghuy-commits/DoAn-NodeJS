const express = require('express');
const router = express.Router();

const { optionalAuth, protect, authorize } = require('../../middleware/auth');
const webCtrl = require('../../controllers/web/webController');
const adminCtrl = require('../../controllers/web/adminController');

const dbStore = require('../../services/dbStore');

// Apply optionalAuth to public SSR pages so logged-in state is reflected in header
router.use(optionalAuth);

// Inject all categories, active path, and dynamic membershipTier to every SSR view
router.use((req, res, next) => {
  res.locals.allCategories = dbStore.getCategories(false);
  res.locals.currentPath = req.path;
  res.locals.query = req.query;

  if (req.user) {
    const { getMembershipTier } = require('../../utils/membershipHelper');
    const userOrders = dbStore.getOrdersByUserId(req.user.id);
    res.locals.membershipTier = getMembershipTier(req.user, userOrders);
  } else {
    res.locals.membershipTier = null;
  }
  next();
});

// Customer Public Routes
router.get('/', webCtrl.renderHome);
router.get('/shop', webCtrl.renderShop);
router.get('/product/:slug', webCtrl.renderProductDetail);
router.get('/lookbook', webCtrl.renderLookbook);
router.get('/blog', webCtrl.renderBlog);
router.get('/blog/:slug', webCtrl.renderBlogDetail);
router.get('/about', webCtrl.renderAbout);
router.get('/contact', webCtrl.renderContact);
router.get('/cart', webCtrl.renderCart);
router.get('/checkout', webCtrl.renderCheckout);
router.get('/order-success', webCtrl.renderOrderSuccess);
router.get('/track-order', webCtrl.renderTrackOrder);
router.get('/tra-cuu-don-hang', webCtrl.renderTrackOrder);

// Auth Routes
const authCtrl = require('../../controllers/api/authController');
router.get('/login', webCtrl.renderLogin);
router.get('/register', webCtrl.renderRegister);
router.get('/forgot-password', webCtrl.renderForgotPassword);
router.get('/logout', webCtrl.logoutWeb);
router.get('/auth/google', authCtrl.googleAuthRedirect);
router.get('/auth/google/callback', authCtrl.googleAuthCallback);

// User Profile (Protected)
router.get('/profile', protect, webCtrl.renderProfile);

// Admin Portal Routes (Protected + Role Admin)
router.get('/admin', protect, authorize('admin'), adminCtrl.renderDashboard);
router.get('/admin/products', protect, authorize('admin'), adminCtrl.renderProducts);
router.get('/admin/products/new', protect, authorize('admin'), adminCtrl.renderNewProduct);
router.get('/admin/products/edit/:id', protect, authorize('admin'), adminCtrl.renderEditProduct);
router.get('/admin/categories', protect, authorize('admin'), adminCtrl.renderCategories);
router.get('/admin/orders', protect, authorize('admin'), adminCtrl.renderOrders);
router.get('/admin/users', protect, authorize('admin'), adminCtrl.renderUsers);

module.exports = router;
