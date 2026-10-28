const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../../middleware/auth');
const { validateRegister, validateLogin, validateProduct, validateOrder } = require('../../middleware/validation');

// Import controllers
const authCtrl = require('../../controllers/api/authController');
const productCtrl = require('../../controllers/api/productController');
const categoryCtrl = require('../../controllers/api/categoryController');
const orderCtrl = require('../../controllers/api/orderController');
const reviewCtrl = require('../../controllers/api/reviewController');
const userCtrl = require('../../controllers/api/userController');

// 1. AUTH ROUTES (5 endpoints)
router.post('/auth/register', validateRegister, authCtrl.register);
router.post('/auth/login', validateLogin, authCtrl.login);
router.post('/auth/logout', authCtrl.logout);
router.get('/auth/me', protect, authCtrl.getMe);
router.put('/auth/change-password', protect, authCtrl.changePassword);

// 2. CATEGORY ROUTES (5 endpoints)
router.get('/categories', categoryCtrl.getCategories);
router.get('/categories/:id', categoryCtrl.getCategoryById);
router.post('/categories', protect, authorize('admin'), categoryCtrl.createCategory);
router.put('/categories/:id', protect, authorize('admin'), categoryCtrl.updateCategory);
router.delete('/categories/:id', protect, authorize('admin'), categoryCtrl.deleteCategory);

// 3. PRODUCT ROUTES (5 endpoints)
router.get('/products', productCtrl.getProducts);
router.get('/products/:id', productCtrl.getProductById);
router.post('/products', protect, authorize('admin'), validateProduct, productCtrl.createProduct);
router.put('/products/:id', protect, authorize('admin'), productCtrl.updateProduct);
router.delete('/products/:id', protect, authorize('admin'), productCtrl.deleteProduct);

// 4. RELATION ROUTES: PRODUCT REVIEWS (2 endpoints)
router.get('/products/:id/reviews', reviewCtrl.getProductReviews);
router.post('/products/:id/reviews', protect, reviewCtrl.createProductReview);

// 5. ORDER ROUTES & BUSINESS APIS (6 endpoints)
router.get('/orders', protect, orderCtrl.getOrders);
router.get('/orders/:id', protect, orderCtrl.getOrderById);
router.post('/orders', validateOrder, orderCtrl.createOrder);
router.patch('/orders/:id/confirm', protect, authorize('admin'), orderCtrl.confirmOrder);
router.patch('/orders/:id/cancel', protect, orderCtrl.cancelOrder);
router.patch('/orders/:id/status', protect, authorize('admin'), orderCtrl.updateOrderStatus);

// 6. USER MANAGEMENT ROUTES (3 endpoints)
router.get('/users', protect, authorize('admin'), userCtrl.getUsers);
router.patch('/users/:id/role', protect, authorize('admin'), userCtrl.updateUserRole);
router.delete('/users/:id', protect, authorize('admin'), userCtrl.deleteUser);

module.exports = router;
