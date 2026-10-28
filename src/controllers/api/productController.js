const dbStore = require('../../services/dbStore');

// @desc    Get all products with Search, Filter, Sort & Pagination
// @route   GET /api/products
const getProducts = (req, res) => {
  try {
    const { search, category, sort, page = 1, limit = 12, priceMin, priceMax, isSale, isFeatured } = req.query;

    const data = dbStore.getProducts({
      search,
      category,
      sort,
      page: Number(page),
      limit: Number(limit),
      priceMin,
      priceMax,
      isSale: isSale === 'true',
      isFeatured: isFeatured === 'true'
    });

    return res.status(200).json({
      success: true,
      data: data.products,
      pagination: data.pagination
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách sản phẩm', error: error.message });
  }
};

// @desc    Get single product by ID or Slug
// @route   GET /api/products/:id
const getProductById = (req, res) => {
  try {
    const { id } = req.params;
    let product = dbStore.getProductById(id);
    if (!product) {
      product = dbStore.getProductBySlug(id);
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm yêu cầu.'
      });
    }

    const reviews = dbStore.getReviewsByProductId(product.id);

    return res.status(200).json({
      success: true,
      data: {
        ...product,
        reviews
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// @desc    Create new product (Admin only)
// @route   POST /api/products
const createProduct = (req, res) => {
  try {
    const category = dbStore.getCategoryById(req.body.category) || dbStore.getCategoryBySlug(req.body.category);
    const categoryName = category ? category.name : 'Phụ kiện';
    const categorySlug = category ? category.slug : '';

    const newProduct = dbStore.createProduct({
      ...req.body,
      categoryName,
      categorySlug
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công!',
      data: newProduct
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tạo sản phẩm', error: error.message });
  }
};

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
const updateProduct = (req, res) => {
  try {
    const { id } = req.params;
    const updated = dbStore.updateProduct(id, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm để cập nhật.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật sản phẩm thành công!',
      data: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật sản phẩm', error: error.message });
  }
};

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
const deleteProduct = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = dbStore.deleteProduct(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm để xóa.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Xóa sản phẩm thành công!'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi khi xóa sản phẩm', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
