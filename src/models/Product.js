const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
  name: String,
  hex: String,
  image: String
}, { _id: false });

const specSchema = new mongoose.Schema({
  material: { type: String, default: 'Chất liệu cao cấp' },
  dimensions: { type: String, default: 'Tiêu chuẩn' },
  lockType: { type: String, default: 'Khóa hợp kim chống gỉ' },
  origin: { type: String, default: 'Việt Nam' },
  warranty: { type: String, default: '12 tháng chính hãng' }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên sản phẩm không được để trống'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Sản phẩm phải thuộc một danh mục']
  },
  price: {
    type: Number,
    required: [true, 'Giá sản phẩm không được để trống'],
    min: [0, 'Giá không được âm']
  },
  originalPrice: {
    type: Number,
    default: function () {
      return this.price;
    }
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Tồn kho không được âm'],
    default: 20
  },
  colors: [colorSchema],
  images: [{
    type: String,
    required: true
  }],
  description: {
    type: String,
    required: [true, 'Mô tả sản phẩm không được để trống']
  },
  highlights: [String],
  specs: {
    type: specSchema,
    default: () => ({})
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 1,
    max: 5
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  soldCount: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isSale: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for high performance search & filter
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1, isSale: 1 });

module.exports = mongoose.model('Product', productSchema);
