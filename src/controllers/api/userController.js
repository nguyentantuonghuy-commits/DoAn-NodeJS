const bcrypt = require('bcryptjs');
const dbStore = require('../../services/dbStore');

// @desc    Get all users with optional filtering & analytics (Admin only)
// @route   GET /api/users
const getUsers = (req, res) => {
  try {
    const { search, role, status, authProvider } = req.query;
    const users = dbStore.getAllUsers({ search, role, status, authProvider });
    const stats = dbStore.getUserStats();

    return res.status(200).json({
      success: true,
      data: users,
      stats
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách người dùng', error: error.message });
  }
};

// @desc    Get single user details with order history (Admin only)
// @route   GET /api/users/:id
const getUserById = (req, res) => {
  try {
    const { id } = req.params;
    const user = dbStore.findUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    const { password: _, ...userWithoutPass } = user;
    const orders = dbStore.getOrdersByUserId(id);
    const validOrders = orders.filter(o => o.orderStatus !== 'cancelled');
    const totalSpent = validOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        ...userWithoutPass,
        orders,
        ordersCount: orders.length,
        totalSpent
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// @desc    Create new user by Admin
// @route   POST /api/users
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, status, authProvider } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Họ tên, email và mật khẩu là các trường bắt buộc.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có độ dài tối thiểu từ 6 ký tự.'
      });
    }

    const existingUser = dbStore.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `Địa chỉ email "${email}" đã tồn tại trên hệ thống!`
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = dbStore.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user',
      status: status === 'locked' ? 'locked' : 'active',
      authProvider: authProvider || 'local',
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      emailVerified: true,
      createdAt: new Date()
    });

    const { password: _, ...userWithoutPass } = newUser;
    return res.status(201).json({
      success: true,
      message: 'Tạo tài khoản người dùng mới thành công!',
      data: userWithoutPass
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tạo người dùng', error: error.message });
  }
};

// @desc    Update user details (Admin only)
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, role, status, newPassword } = req.body;

    const user = dbStore.findUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    // Protection: Prevent admin from locking or demoting self
    if (id === req.user.id) {
      if (status === 'locked') {
        return res.status(400).json({
          success: false,
          message: 'Bạn không thể tự khóa tài khoản của chính mình!'
        });
      }
      if (role && role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Bạn không thể tự hạ quyền Admin của chính mình!'
        });
      }
    }

    // Protection: Primary system admin root protection
    if (id === 'user_admin' && status === 'locked') {
      return res.status(400).json({
        success: false,
        message: 'Không thể khóa tài khoản Quản trị viên gốc của hệ thống!'
      });
    }

    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (address !== undefined) updateFields.address = address.trim();
    if (role && ['admin', 'user'].includes(role)) updateFields.role = role;
    if (status && ['active', 'locked'].includes(status)) updateFields.status = status;

    if (newPassword && newPassword.trim()) {
      if (user.authProvider === 'google' || user.googleId) {
        return res.status(400).json({
          success: false,
          message: 'Tài khoản này liên kết xác thực qua Google SSO và được bảo mật bởi Google. Bạn không thể thiết lập mật khẩu cục bộ cho tài khoản Google.'
        });
      }
      if (newPassword.trim().length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu mới phải có tối thiểu 6 ký tự.'
        });
      }
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(newPassword.trim(), salt);
    }

    const updated = dbStore.updateUser(id, updateFields);
    const { password: _, ...userWithoutPass } = updated;

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin người dùng thành công!',
      data: userWithoutPass
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// @desc    Toggle lock / active user status (Admin only)
// @route   PATCH /api/users/:id/status
const toggleUserStatus = (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể tự khóa tài khoản của chính mình!'
      });
    }

    if (id === 'user_admin') {
      return res.status(400).json({
        success: false,
        message: 'Không thể khóa tài khoản Quản trị viên gốc của hệ thống!'
      });
    }

    const updated = dbStore.toggleUserStatus(id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    const statusText = updated.status === 'locked' ? 'Tạm khóa' : 'Mở khóa kích hoạt';
    return res.status(200).json({
      success: true,
      message: `Đã ${statusText} tài khoản người dùng thành công!`,
      status: updated.status
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// @desc    Update user role (Admin only)
// @route   PATCH /api/users/:id/role
const updateUserRole = (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Vai trò chỉ có thể là admin hoặc user.' });
    }

    if (id === req.user.id && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự hạ quyền Admin của chính mình!' });
    }

    const updated = dbStore.updateUser(id, { role });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    const { password: _, ...userWithoutPass } = updated;
    return res.status(200).json({
      success: true,
      message: `Đã cập nhật vai trò người dùng thành: ${role.toUpperCase()}`,
      data: userWithoutPass
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// @desc    Delete user safely (Admin only)
// @route   DELETE /api/users/:id
const deleteUser = (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự xóa tài khoản của chính mình!' });
    }

    if (id === 'user_admin') {
      return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản Quản trị viên gốc!' });
    }

    const result = dbStore.deleteUser(id);
    if (!result.success) {
      return res.status(404).json({ success: false, message: result.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Đã xóa tài khoản người dùng thành công khỏi hệ thống!',
      detachedOrdersCount: result.detachedOrdersCount
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// @desc    Upload & update user avatar using Multer
// @route   POST /api/users/avatar
const updateAvatar = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn một tệp hình ảnh để tải lên.'
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const updated = dbStore.updateUser(req.user.id, { avatar: avatarUrl });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tài khoản người dùng.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật ảnh đại diện thành công!',
      avatar: avatarUrl
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tải ảnh đại diện lên máy chủ',
      error: error.message
    });
  }
};

// @desc    Reset avatar to default initials (NT, etc.)
// @route   POST /api/users/avatar/default
const resetAvatarToDefault = (req, res) => {
  try {
    const { generateInitialsAvatar } = require('../../utils/avatarHelper');
    const defaultAvatar = generateInitialsAvatar(req.user.name);
    const updated = dbStore.updateUser(req.user.id, { avatar: defaultAvatar });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tài khoản.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Đã khôi phục ảnh đại diện chữ mặc định!',
      avatar: defaultAvatar
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi khôi phục ảnh mặc định',
      error: error.message
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  updateUserRole,
  deleteUser,
  updateAvatar,
  resetAvatarToDefault
};
