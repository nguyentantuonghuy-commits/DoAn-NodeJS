const express = require('express');
const router = express.Router();

const { optionalAuth, protect, authorize } = require('../../middleware/auth');
const { validateRegister, validateLogin, validateProduct, validateOrder } = require('../../middleware/validation');
const { uploadAvatar, uploadProductImage } = require('../../middleware/upload');

// Import controllers
const authCtrl = require('../../controllers/api/authController');
const productCtrl = require('../../controllers/api/productController');
const categoryCtrl = require('../../controllers/api/categoryController');
const orderCtrl = require('../../controllers/api/orderController');
const reviewCtrl = require('../../controllers/api/reviewController');
const userCtrl = require('../../controllers/api/userController');

// 1. AUTH ROUTES (8 endpoints)
router.post('/auth/register', validateRegister, authCtrl.register);
router.post('/auth/login', validateLogin, authCtrl.login);
router.get('/auth/google', authCtrl.googleAuthRedirect);
router.get('/auth/google/callback', authCtrl.googleAuthCallback);
router.post('/auth/google', authCtrl.googleAuth);
router.post('/auth/logout', authCtrl.logout);
router.get('/auth/me', protect, authCtrl.getMe);
router.put('/auth/change-password', protect, authCtrl.changePassword);
router.post('/auth/forgot-password', authCtrl.forgotPassword);
router.post('/auth/verify-reset-otp', authCtrl.verifyResetOTP);
router.post('/auth/reset-password', authCtrl.resetPassword);

// 2. CATEGORY ROUTES (7 endpoints)
router.get('/categories', categoryCtrl.getCategories);
router.get('/categories/:id', categoryCtrl.getCategoryById);
router.get('/categories/:id/products', categoryCtrl.getCategoryProducts);
router.post('/categories', protect, authorize('admin'), categoryCtrl.createCategory);
router.put('/categories/:id', protect, authorize('admin'), categoryCtrl.updateCategory);
router.patch('/categories/:id/toggle-visibility', protect, authorize('admin'), categoryCtrl.toggleCategoryVisibility);
router.delete('/categories/:id', protect, authorize('admin'), categoryCtrl.deleteCategory);

// 3. PRODUCT ROUTES (6 endpoints)
router.get('/products', productCtrl.getProducts);
router.get('/products/:id', productCtrl.getProductById);
router.post('/products', protect, authorize('admin'), validateProduct, productCtrl.createProduct);
router.post('/products/upload-image', protect, authorize('admin'), uploadProductImage.single('image'), productCtrl.uploadProductImage);
router.put('/products/:id', protect, authorize('admin'), productCtrl.updateProduct);
router.patch('/products/:id/toggle-visibility', protect, authorize('admin'), productCtrl.toggleProductVisibility);
router.delete('/products/:id', protect, authorize('admin'), productCtrl.deleteProduct);

// 4. RELATION ROUTES: PRODUCT REVIEWS (2 endpoints)
router.get('/products/:id/reviews', reviewCtrl.getProductReviews);
router.post('/products/:id/reviews', protect, reviewCtrl.createProductReview);

// 5. ORDER ROUTES & BUSINESS APIS (7 endpoints)
router.all('/orders/track', orderCtrl.trackOrder);
router.get('/orders', protect, orderCtrl.getOrders);
router.get('/orders/:id', protect, orderCtrl.getOrderById);
router.post('/orders', optionalAuth, validateOrder, orderCtrl.createOrder);
router.patch('/orders/:id/confirm', protect, authorize('admin'), orderCtrl.confirmOrder);
router.patch('/orders/:id/cancel', protect, orderCtrl.cancelOrder);
router.patch('/orders/:id/status', protect, authorize('admin'), orderCtrl.updateOrderStatus);

// 6. USER MANAGEMENT & PROFILE ROUTES (9 endpoints)
router.post('/users/avatar', protect, uploadAvatar.single('avatar'), userCtrl.updateAvatar);
router.post('/users/avatar/default', protect, userCtrl.resetAvatarToDefault);
router.get('/users', protect, authorize('admin'), userCtrl.getUsers);
router.post('/users', protect, authorize('admin'), userCtrl.createUser);
router.get('/users/:id', protect, authorize('admin'), userCtrl.getUserById);
router.put('/users/:id', protect, authorize('admin'), userCtrl.updateUser);
router.patch('/users/:id/role', protect, authorize('admin'), userCtrl.updateUserRole);
router.patch('/users/:id/status', protect, authorize('admin'), userCtrl.toggleUserStatus);
router.delete('/users/:id', protect, authorize('admin'), userCtrl.deleteUser);

module.exports = router;
