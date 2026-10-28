const jwt = require('jsonwebtoken');
const dbStore = require('../services/dbStore');

const JWT_SECRET = process.env.JWT_SECRET || 'atelier_accessories_secret_key_2026';

// Middleware to protect routes (Enforces login)
const protect = (req, res, next) => {
  let token = null;

  // Check Cookie first (for SSR web navigation)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Check Authorization Bearer header (for REST API)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(401).json({
        success: false,
        message: 'Bạn chưa đăng nhập. Vui lòng cung cấp token hợp lệ.'
      });
    }
    return res.redirect(`/login?redirect=${encodeURIComponent(req.originalUrl)}`);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = dbStore.findUserById(decoded.id);

    if (!user) {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(401).json({ success: false, message: 'Tài khoản không còn tồn tại trên hệ thống.' });
      }
      res.clearCookie('token');
      return res.redirect('/login');
    }

    req.user = user;
    res.locals.currentUser = user;
    next();
  } catch (err) {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
    res.clearCookie('token');
    return res.redirect('/login');
  }
};

// Optional Auth (For SSR pages where logged-in user gets special UI like avatar/role)
const optionalAuth = (req, res, next) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = dbStore.findUserById(decoded.id);
      if (user) {
        req.user = user;
        res.locals.currentUser = user;
      }
    } catch (e) {
      // Ignore token failure for public routes
      res.clearCookie('token');
    }
  }
  next();
};

// Middleware to restrict by roles (RBAC)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập trước khi thực hiện.' });
      }
      return res.redirect('/login');
    }

    if (!roles.includes(req.user.role)) {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(403).json({
          success: false,
          message: `Truy cập bị từ chối. Bạn không có quyền truy cập tài nguyên này (Cần quyền: ${roles.join(' hoặc ')}).`
        });
      }
      return res.status(403).render('pages/404', {
        title: '403 - Không Có Quyền Truy Cập',
        message: 'Bạn không có quyền quản trị để truy cập vào khu vực này.'
      });
    }

    next();
  };
};

module.exports = {
  protect,
  optionalAuth,
  authorize,
  JWT_SECRET
};
