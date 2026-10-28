const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderCode: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  customerName: {
    type: String,
    required: [true, 'Tên khách hàng không được để trống'],
    trim: true
  },
  customerPhone: {
    type: String,
    required: [true, 'Số điện thoại không được để trống'],
    trim: true
  },
  customerEmail: {
    type: String,
    default: ''
  },
  shippingAddress: {
    type: String,
    required: [true, 'Địa chỉ nhận hàng không được để trống']
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'bank_transfer', 'momo'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  note: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
