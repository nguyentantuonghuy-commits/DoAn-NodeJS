const dbStore = require('../../services/dbStore');

// @desc    Get all users (Admin only)
// @route   GET /api/users
const getUsers = (req, res) => {
  try {
    const users = dbStore.getAllUsers();
    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi tải người dùng', error: error.message });
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

    const updated = dbStore.updateUser(id, { role });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    const { password: _, ...userWithoutPass } = updated;
    return res.status(200).json({
      success: true,
      message: `Đã cập nhật vai trò người dùng thành: ${role}`,
      data: userWithoutPass
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
const deleteUser = (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự xóa tài khoản của chính mình!' });
    }

    const index = dbStore.data.users.findIndex(u => u.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    dbStore.data.users.splice(index, 1);
    dbStore.saveToFile();

    return res.status(200).json({
      success: true,
      message: 'Đã xóa người dùng thành công!'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  deleteUser
};
