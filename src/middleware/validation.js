// Backend Request Validation Middleware

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Họ tên không được để trống và phải có ít nhất 2 ký tự.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push('Email không hợp lệ hoặc sai định dạng.');
  }

  if (!password || password.length < 6) {
    errors.push('Mật khẩu bắt buộc và phải có độ dài từ 6 ký tự trở lên.');
  }

  if (errors.length > 0) {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(400).json({ success: false, errors, message: errors[0] });
    }
    return res.status(400).render('pages/auth/register', {
      title: 'Đăng Ký Tài Khoản | Atelier Accessories',
      errorMessage: errors.join(' '),
      formData: req.body
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ email và mật khẩu.' });
    }
    return res.status(400).render('pages/auth/login', {
      title: 'Đăng Nhập | Atelier Accessories',
      errorMessage: 'Vui lòng nhập đầy đủ email và mật khẩu.',
      formData: req.body
    });
  }
  next();
};

const validateProduct = (req, res, next) => {
  const { name, price, stock, category } = req.body;
  const errors = [];

  if (!name || name.trim().length < 3) {
    errors.push('Tên sản phẩm không được để trống (tối thiểu 3 ký tự).');
  }

  if (price === undefined || isNaN(price) || Number(price) < 0) {
    errors.push('Giá sản phẩm phải là một số không âm.');
  }

  if (stock !== undefined && (isNaN(stock) || Number(stock) < 0)) {
    errors.push('Số lượng tồn kho không được là số âm.');
  }

  if (!category) {
    errors.push('Vui lòng chọn danh mục cho sản phẩm.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  next();
};

const validateOrder = (req, res, next) => {
  const { customerName, customerPhone, shippingAddress, items } = req.body;
  const errors = [];

  if (!customerName || customerName.trim().length < 2) {
    errors.push('Vui lòng nhập họ tên người nhận.');
  }

  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!customerPhone || !phoneRegex.test(customerPhone.replace(/\s+/g, ''))) {
    errors.push('Số điện thoại không hợp lệ (định dạng 10 số Việt Nam).');
  }

  if (!shippingAddress || shippingAddress.trim().length < 5) {
    errors.push('Địa chỉ giao hàng không được để trống.');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('Giỏ hàng trống. Vui lòng chọn ít nhất 1 sản phẩm.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateOrder
};
