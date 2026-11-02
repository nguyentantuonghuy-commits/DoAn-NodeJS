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
  const { name, category, hasVariants, variants } = req.body;
  let { price, stock } = req.body;
  const errors = [];

  if (!name || name.trim().length < 3) {
    errors.push('Tên sản phẩm không được để trống (tối thiểu 3 ký tự).');
  }

  if (!category) {
    errors.push('Vui lòng chọn danh mục cho sản phẩm.');
  }

  if (hasVariants && Array.isArray(variants) && variants.length > 0) {
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.name || !v.name.trim()) {
        errors.push(`Phân loại thứ ${i + 1} chưa có tên.`);
      }
      if (v.price === undefined || isNaN(v.price) || Number(v.price) < 0) {
        errors.push(`Giá bán của "${v.name || 'Phân loại ' + (i + 1)}" phải là số không âm.`);
      }
      if (v.stock === undefined || isNaN(v.stock) || Number(v.stock) < 0) {
        errors.push(`Tồn kho của "${v.name || 'Phân loại ' + (i + 1)}" phải là số không âm.`);
      }
    }
    // Auto populate min price & total stock if not supplied
    if (price === undefined || isNaN(price)) {
      req.body.price = Math.min(...variants.map(v => Number(v.price) || 0));
    }
    if (stock === undefined || isNaN(stock)) {
      req.body.stock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    }
  } else {
    if (price === undefined || isNaN(price) || Number(price) < 0) {
      errors.push('Giá sản phẩm phải là một số không âm.');
    }
    if (stock !== undefined && (isNaN(stock) || Number(stock) < 0)) {
      errors.push('Số lượng tồn kho không được là số âm.');
    }
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

  if (!customerPhone || typeof customerPhone !== 'string') {
    errors.push('Vui lòng nhập số điện thoại người nhận.');
  } else {
    const cleanPhone = customerPhone.trim().replace(/^(\+84)/, '0').replace(/^(84)/, '0');
    const phoneRegex = /^0(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      errors.push('Số điện thoại không hợp lệ! Vui lòng chỉ nhập đúng 10 chữ số di động (Ví dụ: 0987654321), không chứa chữ cái hoặc ký tự đặc biệt.');
    } else {
      req.body.customerPhone = cleanPhone;
    }
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
