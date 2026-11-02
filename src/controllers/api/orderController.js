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

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Đơn hàng không có sản phẩm nào.' });
    }

    // Server-side Price Verification: Never trust client price blindly!
    const verifiedItems = [];
    for (const item of items) {
      const prodId = item.productId || item.id;
      const product = dbStore.getProductById(prodId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Sản phẩm "${item.productName || prodId}" không tồn tại trong hệ thống.` });
      }

      let verifiedPrice = Number(product.price) || 0;

      // If product has variants, match variant price by name/color or variantId
      if (product.hasVariants && product.variants && product.variants.length > 0) {
        const matchingVariant = product.variants.find(v => 
          (item.variantId && v.id === item.variantId) || 
          (item.color && v.name && v.name.toLowerCase().trim() === item.color.toLowerCase().trim())
        );

        if (matchingVariant && Number(matchingVariant.price) > 0) {
          verifiedPrice = Number(matchingVariant.price);
        } else if (product.variants[0] && Number(product.variants[0].price) > 0) {
          verifiedPrice = Number(product.variants[0].price);
        }
      }

      // Security Check: Price MUST be strictly positive!
      if (!verifiedPrice || verifiedPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: `Lỗi: Giá của sản phẩm "${product.name}" không hợp lệ (bằng 0 hoặc âm).`
        });
      }

      const verifiedQty = Math.max(1, parseInt(item.quantity, 10) || 1);

      verifiedItems.push({
        productId: product.id,
        productName: product.name,
        price: verifiedPrice,
        quantity: verifiedQty,
        color: item.color || 'Tiêu chuẩn',
        image: item.image || (product.images && product.images[0]) || ''
      });
    }

    // Official calculation from verified prices
    const subtotal = verifiedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = subtotal >= 299000 ? 0 : 25000;
    const totalAmount = subtotal + shippingFee;

    const newOrder = dbStore.createOrder({
      userId: req.user ? req.user.id : null,
      customerName,
      customerPhone,
      customerEmail: customerEmail || (req.user ? req.user.email : ''),
      shippingAddress,
      paymentMethod,
      items: verifiedItems,
      subtotal,
      shippingFee,
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

// @desc    Track order for guest or customer (Public)
// @route   ALL /api/orders/track
const trackOrder = (req, res) => {
  try {
    const query = (req.body?.query || req.query?.query || req.query?.code || req.query?.phone || '').trim();
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp Mã đơn hàng (ví dụ: ORD-12345) hoặc Số điện thoại đặt hàng.'
      });
    }

    const allOrders = dbStore.getAllOrders();
    const cleanQuery = query.toLowerCase().replace(/\s+/g, '');

    // 1. Direct match by orderCode or id
    const exactOrder = allOrders.find(o => 
      (o.orderCode && o.orderCode.toLowerCase() === cleanQuery) ||
      (o.id && o.id.toLowerCase() === cleanQuery)
    );

    if (exactOrder) {
      return res.status(200).json({
        success: true,
        type: 'single',
        data: exactOrder
      });
    }

    // 2. Match by phone number (removing non-digits)
    const phoneDigits = query.replace(/[^\d]/g, '');
    if (phoneDigits.length >= 8) {
      const matchingOrders = allOrders.filter(o => {
        if (!o.customerPhone) return false;
        const oPhone = String(o.customerPhone).replace(/[^\d]/g, '');
        return oPhone === phoneDigits || oPhone.endsWith(phoneDigits) || phoneDigits.endsWith(oPhone);
      });

      if (matchingOrders.length > 0) {
        return res.status(200).json({
          success: true,
          type: matchingOrders.length === 1 ? 'single' : 'multiple',
          data: matchingOrders.length === 1 ? matchingOrders[0] : matchingOrders
        });
      }
    }

    // 3. Partial match by order code
    const partialMatch = allOrders.filter(o => 
      o.orderCode && o.orderCode.toLowerCase().includes(cleanQuery)
    );

    if (partialMatch.length > 0) {
      return res.status(200).json({
        success: true,
        type: partialMatch.length === 1 ? 'single' : 'multiple',
        data: partialMatch.length === 1 ? partialMatch[0] : partialMatch
      });
    }

    return res.status(404).json({
      success: false,
      message: `Không tìm thấy đơn hàng nào khớp với "${query}". Vui lòng kiểm tra lại mã đơn hoặc số điện thoại.`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tra cứu đơn hàng',
      error: error.message
    });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  confirmOrder,
  cancelOrder,   
  updateOrderStatus,
  trackOrder
};
