const express = require('express');
const router = express.Router();

const { optionalAuth, protect, authorize } = require('../../middleware/auth');
const webCtrl = require('../../controllers/web/webController');
const adminCtrl = require('../../controllers/web/adminController');

// Apply optionalAuth to public SSR pages so logged-in state is reflected in header
router.use(optionalAuth);

// Customer Public Routes
router.get('/', webCtrl.renderHome);
router.get('/shop', webCtrl.renderShop);
router.get('/product/:slug', webCtrl.renderProductDetail);
router.get('/cart', webCtrl.renderCart);
router.get('/checkout', webCtrl.renderCheckout);
router.get('/order-success', webCtrl.renderOrderSuccess);

// Auth Routes
router.get('/login', webCtrl.renderLogin);
router.get('/register', webCtrl.renderRegister);
router.get('/logout', webCtrl.logoutWeb);

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
