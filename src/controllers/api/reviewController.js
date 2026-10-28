const dbStore = require('../../services/dbStore');

// @desc    Get reviews for a product (Relation API)
// @route   GET /api/products/:id/reviews
const getProductReviews = (req, res) => {
  try {
    const { id } = req.params;
    const product = dbStore.getProductById(id) || dbStore.getProductBySlug(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
    }

    const reviews = dbStore.getReviewsByProductId(product.id);
    return res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi tải đánh giá', error: error.message });
  }
};

// @desc    Create review for a product (Relation API)
// @route   POST /api/products/:id/reviews
const createProductReview = (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const product = dbStore.getProductById(id) || dbStore.getProductBySlug(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
    }

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ success: false, message: 'Đánh giá phải từ 1 đến 5 sao.' });
    }

    if (!comment || comment.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Nội dung nhận xét tối thiểu 3 ký tự.' });
    }

    const newReview = dbStore.createReview({
      productId: product.id,
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      rating: Number(rating),
      comment: comment.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Cảm ơn bạn đã gửi đánh giá sản phẩm!',
      data: newReview
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi gửi đánh giá', error: error.message });
  }
};

module.exports = {
  getProductReviews,
  createProductReview
};
