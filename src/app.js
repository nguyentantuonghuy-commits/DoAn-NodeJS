const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const webRoutes = require('./routes/web');

const app = express();

// 1. Template Engine Setup (Pug SSR)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));

// 2. Built-in Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// 3. Connect to Database (with auto-fallback to Store)
connectDB();

// 4. Mount Routes
app.use('/api', apiRoutes); // RESTful API Routes
app.use('/', webRoutes);    // Server-side Rendering Routes

// 5. 404 Not Found Handler
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `Endpoint API "${req.originalUrl}" không tồn tại trên hệ thống.`
    });
  }
  return res.status(404).render('pages/404', {
    title: '404 - Không Tìm Thấy Trang | Atelier Accessories',
    message: `Đường dẫn "${req.originalUrl}" không tồn tại hoặc đã được chuyển dời.`
  });
});

// 6. Global Error Handling Middleware (Prevents server crash)
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  const statusCode = err.status || 500;

  if (req.originalUrl.startsWith('/api')) {
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'Lỗi hệ thống nội bộ máy chủ (500)',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  return res.status(statusCode).render('pages/404', {
    title: 'Lỗi Máy Chủ | Atelier Accessories',
    message: 'Đã xảy ra lỗi trong quá trình xử lý yêu cầu. Vui lòng thử lại sau.'
  });
});

module.exports = app;
