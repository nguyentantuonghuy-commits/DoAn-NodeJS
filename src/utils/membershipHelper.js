/**
 * Helper tính toán cấp bậc thành viên (Membership Loyalty Tier) theo chi tiêu & số đơn hàng thực tế
 * 
 * HỆ THỐNG TIÊU CHUẨN KÉP ATELIER (DUAL-CRITERIA & ANTI-LOOPHOLE):
 * - Ngăn chặn tình trạng đặt spam các đơn giá rẻ để thăng hạng VIP.
 * - Yêu cầu cả 2 điều kiện: Tối thiểu số đơn thành công VÀ Tổng chi tiêu tích lũy.
 * 
 * 1. 🌱 Thành Viên Mới (New Member)     : 0 đơn hàng hoặc chưa đủ 1.000.000đ (Voucher chào mừng 10%)
 * 2. 🥈 Thành Viên Bạc (Silver Member)  : Tối thiểu 2 đơn VÀ Tích lũy >= 1.000.000đ
 * 3. 🌟 Thành Viên Vàng (Gold Member)    : Tối thiểu 4 đơn VÀ Tích lũy >= 3.000.000đ
 * 4. 👑 Thành Viên VIP (Platinum VIP)   : Tối thiểu 6 đơn VÀ Tích lũy >= 6.000.000đ (Hoặc chi tiêu lớn >= 8.000.000đ)
 */

const getMembershipTier = (user, orders = []) => {
  if (!user) return null;

  // Nếu là Quản trị viên
  if (user.role === 'admin') {
    return {
      level: 'admin',
      name: 'Quản Trị Viên',
      shortName: 'ADMIN',
      badgeClass: 'badge-hot',
      color: '#D97706',
      bg: '#FEF3C7',
      ordersCount: 0,
      totalSpent: 0,
      nextTier: null,
      ordersNeeded: 0,
      spentNeeded: 0,
      progress: 100,
      hintText: 'Tài khoản Quản Trị Hệ Thống',
      privilege: 'Toàn quyền quản trị hệ thống'
    };
  }

  // Lọc các đơn hàng hợp lệ (không tính đơn đã hủy)
  const validOrders = orders.filter(o => o.orderStatus !== 'cancelled');
  const ordersCount = validOrders.length;
  const totalSpent = validOrders.reduce((sum, o) => {
    return sum + (Number(o.finalTotal) || Number(o.totalAmount) || 0);
  }, 0);

  // HẠNG 4: THÀNH VIÊN VIP (Đã mua >= 6 đơn VÀ tích lũy >= 6.000.000đ, hoặc khách chi tiêu lớn >= 8.000.000đ)
  if ((ordersCount >= 6 && totalSpent >= 6000000) || totalSpent >= 8000000) {
    return {
      level: 'vip',
      name: 'Thành Viên VIP',
      shortName: 'VIP',
      badgeClass: 'badge-hot',
      color: '#D97706',
      bg: '#FEF3C7',
      ordersCount,
      totalSpent,
      nextTier: null,
      ordersNeeded: 0,
      spentNeeded: 0,
      progress: 100,
      hintText: 'Bạn đã đạt cấp bậc VIP cao nhất với mọi đặc quyền tối đa!',
      privilege: 'Giảm 10% trọn đời • Freeship hỏa tốc toàn quốc'
    };
  }

  // HẠNG 3: THÀNH VIÊN VÀNG (Đã mua >= 4 đơn VÀ tích lũy >= 3.000.000đ)
  if (ordersCount >= 4 && totalSpent >= 3000000) {
    const ordersNeeded = Math.max(0, 6 - ordersCount);
    const spentNeeded = Math.max(0, 6000000 - totalSpent);
    const orderProgress = Math.min(1, ordersCount / 6);
    const spentProgress = Math.min(1, totalSpent / 6000000);
    const progress = Math.min(99, Math.round(((orderProgress + spentProgress) / 2) * 100));

    let hintText = '';
    if (ordersNeeded > 0 && spentNeeded > 0) {
      hintText = `Cần thêm ${ordersNeeded} đơn hàng và tích lũy ${spentNeeded.toLocaleString('vi-VN')}đ nữa để lên VIP!`;
    } else if (spentNeeded > 0) {
      hintText = `Cần tích lũy thêm ${spentNeeded.toLocaleString('vi-VN')}đ nữa để lên VIP!`;
    } else {
      hintText = `Cần thêm ${ordersNeeded} đơn hàng nữa để lên VIP!`;
    }

    return {
      level: 'gold',
      name: 'Thành Viên Vàng',
      shortName: 'VÀNG',
      badgeClass: 'badge-gold',
      color: '#B45309',
      bg: '#FEF3C7',
      ordersCount,
      totalSpent,
      nextTier: 'Thành Viên VIP',
      ordersNeeded,
      spentNeeded,
      progress,
      hintText,
      privilege: 'Giảm 5% mọi đơn hàng • Quà tặng sinh nhật độc quyền'
    };
  }

  // HẠNG 2: THÀNH VIÊN BẠC (Đã mua >= 2 đơn VÀ tích lũy >= 1.000.000đ)
  if (ordersCount >= 2 && totalSpent >= 1000000) {
    const ordersNeeded = Math.max(0, 4 - ordersCount);
    const spentNeeded = Math.max(0, 3000000 - totalSpent);
    const orderProgress = Math.min(1, ordersCount / 4);
    const spentProgress = Math.min(1, totalSpent / 3000000);
    const progress = Math.min(99, Math.round(((orderProgress + spentProgress) / 2) * 100));

    let hintText = '';
    if (ordersNeeded > 0 && spentNeeded > 0) {
      hintText = `Cần thêm ${ordersNeeded} đơn hàng và tích lũy ${spentNeeded.toLocaleString('vi-VN')}đ nữa để lên Vàng!`;
    } else if (spentNeeded > 0) {
      hintText = `Cần tích lũy thêm ${spentNeeded.toLocaleString('vi-VN')}đ nữa để lên Vàng!`;
    } else {
      hintText = `Cần thêm ${ordersNeeded} đơn hàng nữa để lên Vàng!`;
    }

    return {
      level: 'silver',
      name: 'Thành Viên Bạc',
      shortName: 'BẠC',
      badgeClass: 'badge-silver',
      color: '#1D4ED8',
      bg: '#EFF6FF',
      ordersCount,
      totalSpent,
      nextTier: 'Thành Viên Vàng',
      ordersNeeded,
      spentNeeded,
      progress,
      hintText,
      privilege: 'Tích lũy 3% giá trị đơn • Đổi trả 30 ngày tận nơi'
    };
  }

  // HẠNG 1: THÀNH VIÊN MỚI (Chưa đủ điều kiện Hạng Bạc)
  const ordersNeeded = Math.max(0, 2 - ordersCount);
  const spentNeeded = Math.max(0, 1000000 - totalSpent);
  const orderProgress = Math.min(1, ordersCount / 2);
  const spentProgress = Math.min(1, totalSpent / 1000000);
  const progress = Math.min(99, Math.round(((orderProgress + spentProgress) / 2) * 100));

  let hintText = '';
  if (ordersNeeded > 0 && spentNeeded > 0) {
    hintText = `Cần mua tối thiểu ${ordersNeeded} đơn hàng và đạt tích lũy 1.000.000đ để lên Thành Viên Bạc!`;
  } else if (spentNeeded > 0) {
    hintText = `Đã đủ số đơn, cần tích lũy thêm ${spentNeeded.toLocaleString('vi-VN')}đ nữa để lên Thành Viên Bạc!`;
  } else {
    hintText = `Cần thêm ${ordersNeeded} đơn hàng nữa để lên Thành Viên Bạc!`;
  }

  return {
    level: 'new',
    name: 'Thành Viên Mới',
    shortName: 'MỚI',
    badgeClass: 'badge-new',
    color: '#475569',
    bg: '#F1F5F9',
    ordersCount,
    totalSpent,
    nextTier: 'Thành Viên Bạc',
    ordersNeeded,
    spentNeeded,
    progress,
    hintText,
    privilege: 'Voucher chào mừng 10% cho đơn hàng đầu tiên'
  };
};

module.exports = {
  getMembershipTier
};
