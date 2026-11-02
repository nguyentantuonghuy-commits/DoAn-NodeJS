const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đường dẫn thư mục lưu ảnh avatar
const uploadDir = path.join(__dirname, '../../public/uploads/avatars');

// Tự động tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu trữ tệp trên đĩa (Disk Storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user ? req.user.id : 'user';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${userId}-${timestamp}${ext}`);
  }
});

// Bộ lọc chỉ cho phép tệp hình ảnh
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext) && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận tệp định dạng hình ảnh (.jpg, .jpeg, .png, .webp, .gif)!'), false);
  }
};

// Cấu hình Multer Upload Middleware cho Avatar (Giới hạn tối đa 5MB)
const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter
});

// Thư mục lưu trữ hình ảnh sản phẩm
const productUploadDir = path.join(__dirname, '../../public/uploads/products');
if (!fs.existsSync(productUploadDir)) {
  fs.mkdirSync(productUploadDir, { recursive: true });
}

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productUploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const rand = Math.round(Math.random() * 1e4);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `prod-${timestamp}-${rand}${ext}`);
  }
});

const uploadProductImage = multer({
  storage: productStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter
});

module.exports = {
  uploadAvatar,
  uploadProductImage
};
