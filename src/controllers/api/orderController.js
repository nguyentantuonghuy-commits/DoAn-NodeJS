const dbStore = require('../../services/dbStore');

// @desc    Get orders (Admin: all orders, User: only own orders)
// @route   GET /api/orders
const getOrders = (req, res) => {
  try {
    let orders = [];
    if (req.user.role === 'admin') {
      orders = dbStore.getAllOrders();
    } else {
      orders = dbStore.getOrdersByUserId(req.user.id);
    }

    return res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách đơn hàng', error: error.message });
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
const getOrderById = (req, res) => {
  try {
    const { id } = req.params;
    const order = dbStore.getOrderById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
    }

    // Role check: User can only see their own order
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem đơn hàng này.' });
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// @desc    Create new order (Checkout)
// @route   POST /api/orders
const createOrder = (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      paymentMethod = 'cod',
      items,
      note
    } = req.body;

    const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);

    const newOrder = dbStore.createOrder({
      userId: req.user ? req.user.id : null,
      customerName,
      customerPhone,
      customerEmail: customerEmail || (req.user ? req.user.email : ''),
      shippingAddress,
      paymentMethod,
      items,
      totalAmount,
      note: note || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công! Mã đơn: ' + newOrder.orderCode,
      data: newOrder
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tạo đơn hàng', error: error.message });
  }
};

// @desc    Confirm an order (Business Logic API)
// @route   PATCH /api/orders/:id/confirm
const confirmOrder = (req, res) => {
  try {
    const { id } = req.params;
    const order = dbStore.getOrderById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
    }

    if (order.orderStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Không thể xác nhận đơn hàng đang ở trạng thái "${order.orderStatus}".`
      });
    }

    const updated = dbStore.updateOrderStatus(id, 'confirmed');

    return res.status(200).json({
      success: true,
      message: 'Đã xác nhận đơn hàng thành công!',
      data: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// @desc    Cancel an order (Business Logic API)
// @route   PATCH /api/orders/:id/cancel
const cancelOrder = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.role === 'admin' ? null : req.user.id;
    const result = dbStore.cancelOrder(id, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: 'Hủy đơn hàng thành công!',
      data: result.order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi khi hủy đơn hàng', error: error.message });
  }
};

// @desc    Update order status (Admin only)
// @route   PATCH /api/orders/:id/status
const updateOrderStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái không hợp lệ. Phải là một trong các giá trị: ${validStatuses.join(', ')}`
      });
    }

    const updated = dbStore.updateOrderStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng để cập nhật.' });
    }

    return res.status(200).json({
      success: true,
      message: `Đã cập nhật trạng thái đơn hàng sang: ${status}`,
      data: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật trạng thái đơn', error: error.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  confirmOrder,
  cancelOrder,
  updateOrderStatus
};
