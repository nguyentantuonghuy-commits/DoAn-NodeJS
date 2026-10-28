const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Review = require('../models/Review');
const seedData = require('./seedData');

const seedMongoDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/atelier_db';
  try {
    await mongoose.connect(uri);
    console.log(`[Mongo Seed] Đang kết nối tới: ${uri}`);

    // 1. Clear existing collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    await Review.deleteMany({});
    console.log('[Mongo Seed] Đã dọn dẹp các collection cũ.');

    // 2. Insert Users
    const createdUsers = await User.insertMany(seedData.users);
    console.log(`[Mongo Seed] Đã thêm ${createdUsers.length} Users vào MongoDB.`);

    const adminUser = createdUsers.find(u => u.role === 'admin') || createdUsers[0];
    const customerUser = createdUsers.find(u => u.role === 'user') || createdUsers[1];

    // 3. Insert Categories
    const categoryDocs = seedData.categories.map(c => ({
      _id: new mongoose.Types.ObjectId(),
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      icon: c.icon,
      itemCount: c.itemCount,
      order: c.order
    }));
    const createdCategories = await Category.insertMany(categoryDocs);
    console.log(`[Mongo Seed] Đã thêm ${createdCategories.length} Categories vào MongoDB.`);

    // Map old category string id (e.g. 'cat_belts') to new Mongo ObjectId
    const categoryMap = {};
    seedData.categories.forEach((cat, idx) => {
      categoryMap[cat.id] = createdCategories[idx]._id;
      categoryMap[cat.slug] = createdCategories[idx]._id;
    });

    // 4. Insert Products
    const productDocs = seedData.products.map(p => {
      const catId = categoryMap[p.category] || categoryMap[p.categorySlug] || createdCategories[0]._id;
      return {
        _id: new mongoose.Types.ObjectId(),
        name: p.name,
        slug: p.slug,
        category: catId,
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discount,
        stock: p.stock,
        colors: p.colors || [],
        images: p.images || [],
        description: p.description,
        highlights: p.highlights || [],
        specs: p.specs || {},
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        soldCount: p.soldCount,
        isFeatured: p.isFeatured,
        isSale: p.isSale
      };
    });
    const createdProducts = await Product.insertMany(productDocs);
    console.log(`[Mongo Seed] Đã thêm ${createdProducts.length} Products vào MongoDB.`);

    const productMap = {};
    seedData.products.forEach((p, idx) => {
      productMap[p.id] = createdProducts[idx]._id;
    });

    // 5. Insert Orders & OrderItems
    for (const ord of seedData.orders) {
      const newOrder = await Order.create({
        orderCode: ord.orderCode,
        user: customerUser._id,
        customerName: ord.customerName,
        customerPhone: ord.customerPhone,
        customerEmail: ord.customerEmail,
        shippingAddress: ord.shippingAddress,
        paymentMethod: ord.paymentMethod,
        paymentStatus: ord.paymentStatus,
        orderStatus: ord.orderStatus,
        totalAmount: ord.totalAmount,
        shippingFee: ord.shippingFee || 0,
        discountAmount: ord.discountAmount || 0,
        note: ord.note || '',
        createdAt: ord.createdAt
      });

      if (ord.items && ord.items.length) {
        for (const item of ord.items) {
          const prodId = productMap[item.productId] || createdProducts[0]._id;
          await OrderItem.create({
            order: newOrder._id,
            product: prodId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
            color: item.color,
            image: item.image
          });
        }
      }
    }
    console.log(`[Mongo Seed] Đã thêm ${seedData.orders.length} Orders và OrderItems vào MongoDB.`);

    // 6. Insert Reviews
    for (const rev of seedData.reviews) {
      const prodId = productMap[rev.productId] || createdProducts[0]._id;
      await Review.create({
        product: prodId,
        user: customerUser._id,
        userName: rev.userName,
        userAvatar: rev.userAvatar,
        rating: rev.rating,
        comment: rev.comment,
        isVerified: rev.isVerified,
        createdAt: rev.createdAt
      });
    }
    console.log(`[Mongo Seed] Đã thêm ${seedData.reviews.length} Reviews vào MongoDB.`);

    console.log('====================================================');
    console.log('🎉 TOÀN BỘ DỮ LIỆU ĐÃ ĐƯỢC NẠP THÀNH CÔNG VÀO MONGODB!');
    console.log('   Database Name: atelier_db');
    console.log('   Collections:   users, categories, products, orders, orderitems, reviews');
    console.log('====================================================');
    return true;
  } catch (error) {
    console.error('[Mongo Seed] Lỗi nạp dữ liệu:', error);
    return false;
  }
};

// If run directly via CLI
if (require.main === module) {
  seedMongoDB().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seedMongoDB;
