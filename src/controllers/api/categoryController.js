const dbStore = require('../../services/dbStore');

// @desc    Get all categories
// @route   GET /api/categories
const getCategories = (req, res) => {
  try {
    const categories = dbStore.getCategories();
    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh mục', error: error.message });
  }
};

// @desc    Get category by ID or Slug
// @route   GET /api/categories/:id
const getCategoryById = (req, res) => {
  try {
    const { id } = req.params;
    let category = dbStore.getCategoryById(id);
    if (!category) {
      category = dbStore.getCategoryBySlug(id);
    }

    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục.' });
    }

    return res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// @desc    Create category (Admin only)
// @route   POST /api/categories
const createCategory = (req, res) => {
  try {
    const { name, description, image, icon } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Tên danh mục không được để trống.' });
    }

    const newCategory = dbStore.createCategory({ name, description, image, icon });
    return res.status(201).json({
      success: true,
      message: 'Tạo danh mục thành công!',
      data: newCategory
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tạo danh mục', error: error.message });
  }
};

// @desc    Update category (Admin only)
// @route   PUT /api/categories/:id
const updateCategory = (req, res) => {
  try {
    const { id } = req.params;
    const updated = dbStore.updateCategory(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục để cập nhật.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật danh mục thành công!',
      data: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật danh mục', error: error.message });
  }
};

// @desc    Delete category (Admin only)
// @route   DELETE /api/categories/:id
const deleteCategory = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = dbStore.deleteCategory(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục để xóa.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Xóa danh mục thành công!'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi khi xóa danh mục', error: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
