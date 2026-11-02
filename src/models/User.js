const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Họ tên không được để trống'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email không được để trống'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không đúng định dạng']
  },
  password: {
    type: String,
    required: function() { return this.authProvider === 'local'; },
    minlength: [6, 'Mật khẩu phải từ 6 ký tự trở lên']
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'locked'],
    default: 'active'
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password trước khi lưu nếu password được sửa 
userSchema.pre('save', async function (next) {
  if (!this.avatar || this.avatar.includes('unsplash.com')) {
    const { generateInitialsAvatar } = require('../utils/avatarHelper');
    this.avatar = generateInitialsAvatar(this.name || 'User');
  }
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
