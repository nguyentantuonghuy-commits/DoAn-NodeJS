/**
 * Curated Fashion Accessories Seed Data
 * Featuring: YaMe, Coolmate, ACFC and Real Clothes styles.
 * Realistic pricing, high-resolution photography, and detailed specifications.
 */

const categories = [
  {
    id: 'cat_belts',
    name: 'Thắt Lưng Da',
    slug: 'that-lung-da',
    description: 'Thắt lưng da bò thật 100%, khóa kim loại titan chống gỉ cao cấp.',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    icon: 'shield',
    itemCount: 4,
    order: 1
  },
  {
    id: 'cat_wallets',
    name: 'Ví Da & Cardholder',
    slug: 'vi-da',
    description: 'Ví gập mini, bóp da sáp vintage và ví đựng thẻ thông minh chống quét trộm RFID.',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    icon: 'credit-card',
    itemCount: 4,
    order: 2
  },
  {
    id: 'cat_caps',
    name: 'Mũ & Nón Streetwear',
    slug: 'mu-non',
    description: 'Nón snapback thêu nổi 3D, mũ bucket canvas kháng nước trẻ trung.',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    icon: 'disc',
    itemCount: 4,
    order: 3
  },
  {
    id: 'cat_sunglasses',
    name: 'Kính Mát Thời Trang',
    slug: 'kinh-mat',
    description: 'Kính râm gọng kim loại phi công và mắt kính phân cực chống tia UV400 bảo vệ mắt.',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    icon: 'eye',
    itemCount: 4,
    order: 4
  },
  {
    id: 'cat_jewelry',
    name: 'Trang Sức Titan & Bạc',
    slug: 'trang-suc-titan',
    description: 'Dây chuyền Cuban link titan, nhẫn khắc họa tiết cổ điển và lắc tay cuff unisex.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    icon: 'award',
    itemCount: 4,
    order: 5
  },
  {
    id: 'cat_bags',
    name: 'Túi Đeo Chéo & Balo',
    slug: 'tui-balo',
    description: 'Túi bao tử streetwear, túi đeo chéo mini vải dù chống thấm cực bền.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    icon: 'shopping-bag',
    itemCount: 4,
    order: 6
  }
];

const products = [
  // Belts
  {
    id: 'prod_1',
    name: 'Thắt Lưng Da Bò Ý Khóa Tự Động Black Onyx',
    slug: 'that-lung-da-bo-y-khoa-tu-dong-black-onyx',
    category: 'cat_belts',
    categorySlug: 'that-lung-da',
    categoryName: 'Thắt Lưng Da',
    price: 349000,
    originalPrice: 499000,
    discount: 30,
    stock: 65,
    hasVariants: true,
    variants: [
      {
        id: 'var_prod_1_1',
        name: 'Đen Onyx',
        color: '#111827',
        price: 349000,
        originalPrice: 499000,
        stock: 30,
        sku: 'prod_1-den',
        image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'var_prod_1_2',
        name: 'Nâu Espresso',
        color: '#4A2C2A',
        price: 379000,
        originalPrice: 529000,
        stock: 20,
        sku: 'prod_1-nau',
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'var_prod_1_3',
        name: 'Xanh Navy',
        color: '#1E3A8A',
        price: 399000,
        originalPrice: 550000,
        stock: 15,
        sku: 'prod_1-xanh',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
      }
    ],
    colors: [
      { name: 'Đen Onyx', hex: '#111827', image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80' },
      { name: 'Nâu Espresso', hex: '#4A2C2A', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Xanh Navy', hex: '#1E3A8A', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80' }
    ],
    images: [
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Thắt lưng da bò nhập khẩu nguyên miếng, gia công xử lý cạnh viền mịn màng. Hệ thống khóa răng trượt tự động cao cấp làm từ hợp kim kẽm mạ titan không phai màu.',
    highlights: ['Da bò thật 100% nguyên tấm', 'Khóa tự động không cần bấm lỗ', 'Bảo hành bong tróc 24 tháng'],
    specs: {
      material: '100% Da bò Top-Grain Ý',
      dimensions: 'Bản rộng 3.5cm - Chiều dài 120cm',
      lockType: 'Khóa tự động mạ PVD chống xước',
      origin: 'Gia công thủ công tại Việt Nam',
      warranty: '24 tháng đổi mới lỗi nhà sản xuất'
    },
    rating: 4.9,
    reviewsCount: 38,
    soldCount: 240,
    isFeatured: true,
    isSale: true
  },
  {
    id: 'prod_2',
    name: 'Dây Nịt Da Sáp Vintage Khóa Kim Cổ Điển',
    slug: 'day-nit-da-sap-vintage-khoa-kim-co-dien',
    category: 'cat_belts',
    categorySlug: 'that-lung-da',
    categoryName: 'Thắt Lưng Da',
    price: 299000,
    originalPrice: 399000,
    discount: 25,
    stock: 30,
    colors: [
      { name: 'Nâu Da Bò', hex: '#8B4513', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80' }
    ],
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Chất liệu da sáp ngựa điên (Crazy Horse Leather) tạo nên vẻ đẹp phong trần bụi bặm, càng dùng lâu da càng bóng đẹp và đậm chất cá tính.',
    highlights: ['Da sáp Crazy Horse cao cấp', 'Khóa kim đồng đúc nguyên khối', 'Phong cách Heritage hoài cổ'],
    specs: {
      material: 'Da bò sáp tự nhiên',
      dimensions: 'Bản 3.8cm, dài 125cm',
      lockType: 'Khóa kim đồng đúc',
      origin: 'Việt Nam',
      warranty: '12 tháng'
    },
    rating: 4.8,
    reviewsCount: 22,
    soldCount: 154,
    isFeatured: false,
    isSale: false
  },

  // Wallets
  {
    id: 'prod_3',
    name: 'Ví Da Gập Đôi Minimalist Slim Bifold',
    slug: 'vi-da-gap-doi-minimalist-slim-bifold',
    category: 'cat_wallets',
    categorySlug: 'vi-da',
    categoryName: 'Ví Da & Cardholder',
    price: 279000,
    originalPrice: 350000,
    discount: 20,
    stock: 60,
    colors: [
      { name: 'Đen Huyền Bí', hex: '#111827', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80' },
      { name: 'Nâu Vỏ Cây', hex: '#5C4033', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80' }
    ],
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Thiết kế siêu mỏng chỉ 0.8cm khi chưa bỏ tiền, dễ dàng bỏ vào túi quần trước mà không gây cộm khó chịu. Tích hợp ngăn thẻ truy cập nhanh.',
    highlights: ['Thiết kế Ultra-slim', 'Chống phồng túi quần', 'Đựng vừa 20 tờ tiền thẳng'],
    specs: {
      material: 'Da bò Nappa cao cấp mềm mịn',
      dimensions: '11cm x 8.5cm x 0.8cm',
      lockType: 'Gập đôi không khóa',
      origin: 'Việt Nam',
      warranty: '12 tháng'
    },
    rating: 5.0,
    reviewsCount: 45,
    soldCount: 310,
    isFeatured: true,
    isSale: true
  },
  {
    id: 'prod_4',
    name: 'Ví Đựng Thẻ Thông Minh Nhôm Titan Bật Thẻ Auto RFID',
    slug: 'vi-dung-the-thong-minh-nhom-titan-bat-the-auto-rfid',
    category: 'cat_wallets',
    categorySlug: 'vi-da',
    categoryName: 'Ví Da & Cardholder',
    price: 220000,
    originalPrice: 290000,
    discount: 24,
    stock: 50,
    colors: [
      { name: 'Bạc Titan', hex: '#C0C0C0', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80' },
      { name: 'Đen Mờ', hex: '#1C1917', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80' }
    ],
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Cơ chế lẫy gạt thông minh đẩy so le 6 thẻ ngân hàng chỉ với một thao tác ngón tay. Vỏ hợp kim nhôm hàng không chặn 100% sóng RFID chống quét trộm tiền trong thẻ.',
    highlights: ['Chống trộm RFID', 'Cơ chế bật thẻ 1 chạm', 'Vỏ nhôm máy bay siêu nhẹ'],
    specs: {
      material: 'Hợp kim nhôm + Bọc da ngoài',
      dimensions: '10cm x 6.5cm x 1.2cm',
      lockType: 'Lẫy cơ học tự động',
      origin: 'Nhập khẩu',
      warranty: '6 tháng'
    },
    rating: 4.9,
    reviewsCount: 19,
    soldCount: 180,
    isFeatured: false,
    isSale: true
  },

  // Caps
  {
    id: 'prod_5',
    name: 'Nón Lưỡi Trai Snapback Streetwear Atelier Signature',
    slug: 'non-luoi-trai-snapback-streetwear-atelier-signature',
    category: 'cat_caps',
    categorySlug: 'mu-non',
    categoryName: 'Mũ & Nón Streetwear',
    price: 189000,
    originalPrice: 250000,
    discount: 24,
    stock: 80,
    colors: [
      { name: 'Đen Trắng', hex: '#000000', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80' },
      { name: 'Trắng Kem', hex: '#FDFBF7', image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80' }
    ],
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Nón lưỡi trai chất liệu 100% Cotton Twill dày dặn đứng form. Họa tiết logo thêu vi tính 3D sắc sảo phía trước, khóa cài kim loại đồng chỉnh vòng đầu dễ dàng.',
    highlights: ['Form nón chuẩn cứng cáp', 'Chất vải Cotton Twill thấm hút', 'Thêu nổi 3D cao cấp'],
    specs: {
      material: '100% Cotton Twill 320gsm',
      dimensions: 'Freesize (55 - 60cm)',
      lockType: 'Khóa gài kim loại điều chỉnh',
      origin: 'Việt Nam',
      warranty: 'Đổi mới nếu lỗi đường may'
    },
    rating: 4.8,
    reviewsCount: 52,
    soldCount: 420,
    isFeatured: true,
    isSale: true
  },
  {
    id: 'prod_6',
    name: 'Mũ Bucket Canvas 2 Mặt Unisex Reverse Hat',
    slug: 'mu-bucket-canvas-2-mat-unisex-reverse-hat',
    category: 'cat_caps',
    categorySlug: 'mu-non',
    categoryName: 'Mũ & Nón Streetwear',
    price: 169000,
    originalPrice: 220000,
    discount: 23,
    stock: 40,
    colors: [
      { name: 'Đen / Vàng Be', hex: '#262626', image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80' }
    ],
    images: [
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Thiết kế thông minh đội được cả 2 mặt với 2 phong cách khác nhau: 1 mặt đen tối giản thanh lịch, 1 mặt vàng be năng động trẻ trung.',
    highlights: ['Đội 2 mặt linh hoạt', 'Chất vải Canvas thoáng khí', 'Vành mũ che nắng tốt'],
    specs: {
      material: 'Vải Canvas 100% Cotton',
      dimensions: 'Vòng đầu 56 - 58cm',
      lockType: 'Không khóa',
      origin: 'Việt Nam',
      warranty: '3 tháng'
    },
    rating: 4.7,
    reviewsCount: 14,
    soldCount: 95,
    isFeatured: false,
    isSale: false
  },

  // Sunglasses
  {
    id: 'prod_7',
    name: 'Kính Mát Phi Công Aviator Gọng Kim Loại Mạ Vàng UV400',
    slug: 'kinh-mat-phi-cong-aviator-gong-kim-loai-ma-vang-uv400',
    category: 'cat_sunglasses',
    categorySlug: 'kinh-mat',
    categoryName: 'Kính Mát Thời Trang',
    price: 299000,
    originalPrice: 450000,
    discount: 33,
    stock: 35,
    colors: [
      { name: 'Tròng Xanh Rêu Gọng Vàng', hex: '#D4AF37', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80' },
      { name: 'Tròng Đen Gọng Bạc', hex: '#000000', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80' }
    ],
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Kiểu dáng kính phi công kinh điển không bao giờ lỗi mốt. Tròng kính phân cực Polarized chống lóa mắt khi lái xe dưới trời nắng gắt và lọc 99.9% tia tử ngoại UVA/UVB.',
    highlights: ['Tròng Polarized chống lóa', 'Chuẩn chống tia cực tím UV400', 'Gọng thép dẻo mạ IP không phai'],
    specs: {
      material: 'Gọng thép không gỉ mạ PVD + Tròng Polycarbonate',
      dimensions: 'Mắt kính 58mm - Cầu kính 14mm - Càng kính 140mm',
      lockType: 'Bản lề lò xo đàn hồi',
      origin: 'Chính hãng Atelier',
      warranty: '12 tháng bản lề và ốc vít'
    },
    rating: 4.9,
    reviewsCount: 31,
    soldCount: 195,
    isFeatured: true,
    isSale: true
  },
  {
    id: 'prod_8',
    name: 'Kính Râm Gọng Vuông Dày Retro Black Noir Y2K',
    slug: 'kinh-ram-gong-vuong-day-retro-black-noir-y2k',
    category: 'cat_sunglasses',
    categorySlug: 'kinh-mat',
    categoryName: 'Kính Mát Thời Trang',
    price: 249000,
    originalPrice: 320000,
    discount: 22,
    stock: 25,
    colors: [
      { name: 'Đen Bóng', hex: '#000000', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80' }
    ],
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Lấy cảm hứng từ thời trang đường phố Hàn Quốc và phong trào Y2K. Gọng kính bản to tôn gương mặt thon gọn, tròng đen tuyền phong cách bí ẩn.',
    highlights: ['Gọng Acetate bóng bẩy', 'Form vuông tôn dáng mặt', 'Bảo vệ UV400 tuyệt đối'],
    specs: {
      material: 'Nhựa Acetate cao cấp',
      dimensions: '54-18-145mm',
      lockType: 'Bản lề 5 chấu chịu lực',
      origin: 'Hàn Quốc',
      warranty: '6 tháng'
    },
    rating: 4.8,
    reviewsCount: 20,
    soldCount: 110,
    isFeatured: false,
    isSale: false
  },

  // Jewelry
  {
    id: 'prod_9',
    name: 'Dây Chuyền Cuban Link Titan Không Gỉ 7mm Bạc Sáng',
    slug: 'day-chuyen-cuban-link-titan-khong-gi-7mm-bac-sang',
    category: 'cat_jewelry',
    categorySlug: 'trang-suc-titan',
    categoryName: 'Trang Sức Titan & Bạc',
    price: 199000,
    originalPrice: 280000,
    discount: 29,
    stock: 75,
    colors: [
      { name: 'Bạc Ánh Kim', hex: '#E5E7EB', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80' }
    ],
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611591475870-ef0218730b2d?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Dây chuyền mắt xích Cuban mắt vát 7mm thời thượng. Chất liệu thép Titan sinh học 316L y tế hoàn toàn không gỉ sét, không đen, không gây dị ứng ngứa ngáy kể cả khi đeo đi tắm biển.',
    highlights: ['Thép titan y tế 316L', 'Không bao giờ đen gỉ', 'Mắt xích vát bóng kim cương'],
    specs: {
      material: 'Titanium 316L',
      dimensions: 'Bản rộng 7mm, Dài 55cm',
      lockType: 'Khóa bấm hộp chắc chắn',
      origin: 'Chính hãng Atelier',
      warranty: 'Trọn đời không gỉ sét'
    },
    rating: 5.0,
    reviewsCount: 63,
    soldCount: 520,
    isFeatured: true,
    isSale: true
  },
  {
    id: 'prod_10',
    name: 'Vòng Tay Nam Lắc Titan Khóa Hộp HipHop Chunky Chain',
    slug: 'vong-tay-nam-lac-titan-khoa-hop-hiphop-chunky-chain',
    category: 'cat_jewelry',
    categorySlug: 'trang-suc-titan',
    categoryName: 'Trang Sức Titan & Bạc',
    price: 159000,
    originalPrice: 210000,
    discount: 24,
    stock: 45,
    colors: [
      { name: 'Bạc Titan', hex: '#E5E7EB', image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80' }
    ],
    images: [
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Điểm nhấn quyền lực trên cổ tay của phái mạnh. Thiết kế xích đan cài tinh xảo kết hợp khóa hộp double-lock tiện lợi, tôn vẻ nam tính mạnh mẽ.',
    highlights: ['Khóa bấm an toàn 2 nấc', 'Chống xước mài mòn cao', 'Đeo êm tay không cộm'],
    specs: {
      material: 'Thép không gỉ Titanium',
      dimensions: 'Bản 8mm, Dài 19cm',
      lockType: 'Khóa hộp bấm đôi',
      origin: 'Việt Nam',
      warranty: 'Trọn đời không đen'
    },
    rating: 4.8,
    reviewsCount: 28,
    soldCount: 210,
    isFeatured: false,
    isSale: false
  },

  // Bags
  {
    id: 'prod_11',
    name: 'Túi Bao Tử Đeo Chéo Crossbody Canvas Chống Nước Yame Style',
    slug: 'tui-bao-tu-deo-cheo-crossbody-canvas-chong-nuoc-yame-style',
    category: 'cat_bags',
    categorySlug: 'tui-balo',
    categoryName: 'Túi Đeo Chéo & Balo',
    price: 249000,
    originalPrice: 350000,
    discount: 29,
    stock: 65,
    colors: [
      { name: 'Đen Khói', hex: '#1F2937', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' },
      { name: 'Xanh Rêu Quân Đội', hex: '#374151', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80' }
    ],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Chiếc túi bất ly thân của các bạn trẻ năng động. Vải tráng PU chống thấm nước vượt trội khi gặp mưa bất chợt. Đựng vừa điện thoại Pro Max, ví tiền, chìa khóa và tai nghe.',
    highlights: ['Kháng nước mưa vượt trội', 'Khóa kéo YKK êm mượt', 'Quai đeo chịu tải 15kg'],
    specs: {
      material: 'Vải Polyester tráng màng chống thấm nước',
      dimensions: '28cm x 15cm x 7cm',
      lockType: 'Khóa kéo YKK chống kẹt',
      origin: 'Việt Nam',
      warranty: '12 tháng dây kéo & quai đeo'
    },
    rating: 4.9,
    reviewsCount: 42,
    soldCount: 380,
    isFeatured: true,
    isSale: true
  },
  {
    id: 'prod_12',
    name: 'Túi Đeo Vai Mini Messenger Bag Street Chic',
    slug: 'tui-deo-vai-mini-messenger-bag-street-chic',
    category: 'cat_bags',
    categorySlug: 'tui-balo',
    categoryName: 'Túi Đeo Chéo & Balo',
    price: 289000,
    originalPrice: 380000,
    discount: 24,
    stock: 35,
    colors: [
      { name: 'Đen All-Black', hex: '#000000', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80' }
    ],
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Thiết kế dáng túi thư báo thu nhỏ cực kỳ thanh lịch. Thích hợp cho cả đi làm lẫn dạo phố cuối tuần, ngăn phụ chống sốc bảo vệ thiết bị điện tử.',
    highlights: ['Ngăn đệm bảo vệ đồ đạc', 'Dáng đứng thanh lịch', 'Nắp gập nam châm hút êm'],
    specs: {
      material: 'Vải Oxford 900D cao cấp',
      dimensions: '22cm x 18cm x 6cm',
      lockType: 'Nắp khóa nam châm tiện lợi',
      origin: 'Việt Nam',
      warranty: '12 tháng'
    },
    rating: 4.8,
    reviewsCount: 25,
    soldCount: 160,
    isFeatured: false,
    isSale: false
  }
];

const users = [
  {
    id: 'user_admin',
    name: 'Quản Trị Viên (Admin)',
    email: 'admin@atelier.vn',
    password: '$2b$10$KbLZBtAtnAJ.yda8gWI8M.j.t1WS5jSp6IgvSNbZm3zUKa.25.T8S', // Admin@123
    role: 'admin',
    phone: '0901234567',
    address: 'Trụ sở chính Atelier Accessories, Quận 1, TP. Hồ Chí Minh',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'user_customer',
    name: 'Nguyễn Văn Minh (Khách hàng)',
    email: 'user@atelier.vn',
    password: '$2b$10$91DBu5HiFTrrrasXrBg1.OkcLIOtw5SEcxOqOkOMf5requ0xLVak6', // User@123
    role: 'user',
    phone: '0987654321',
    address: 'Số 88 Đường Nguyễn Trãi, Phường 3, Quận 5, TP. Hồ Chí Minh',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  }
];

const orders = [
  {
    id: 'ord_1',
    orderCode: 'ORD-89421',
    userId: 'user_customer',
    customerName: 'Nguyễn Văn Minh',
    customerPhone: '0987654321',
    customerEmail: 'user@atelier.vn',
    shippingAddress: 'Số 88 Đường Nguyễn Trãi, Phường 3, Quận 5, TP. Hồ Chí Minh',
    paymentMethod: 'cod',
    paymentStatus: 'unpaid',
    orderStatus: 'confirmed',
    totalAmount: 628000,
    shippingFee: 0,
    discountAmount: 20000,
    note: 'Giao giờ hành chính giúp mình nhé.',
    items: [
      {
        id: 'item_1',
        productId: 'prod_1',
        productName: 'Thắt Lưng Da Bò Ý Khóa Tự Động Black Onyx',
        price: 349000,
        quantity: 1,
        color: 'Đen Onyx',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'item_2',
        productId: 'prod_3',
        productName: 'Ví Da Gập Đôi Minimalist Slim Bifold',
        price: 279000,
        quantity: 1,
        color: 'Đen Huyền Bí',
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80'
      }
    ],
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 2)
  },
  {
    id: 'ord_2',
    orderCode: 'ORD-91203',
    userId: 'user_customer',
    customerName: 'Nguyễn Văn Minh',
    customerPhone: '0987654321',
    customerEmail: 'user@atelier.vn',
    shippingAddress: 'Số 88 Đường Nguyễn Trãi, Phường 3, Quận 5, TP. Hồ Chí Minh',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    orderStatus: 'pending',
    totalAmount: 199000,
    shippingFee: 0,
    discountAmount: 0,
    note: 'Kiểm tra kỹ trước khi đóng gói nhé shop.',
    items: [
      {
        id: 'item_3',
        productId: 'prod_9',
        productName: 'Dây Chuyền Cuban Link Titan Không Gỉ 7mm Bạc Sáng',
        price: 199000,
        quantity: 1,
        color: 'Bạc Ánh Kim',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
      }
    ],
    createdAt: new Date()
  }
];

const reviews = [
  {
    id: 'rev_1',
    productId: 'prod_1',
    userId: 'user_customer',
    userName: 'Minh Nguyễn',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    comment: 'Thắt lưng da cầm rất đầm tay, khóa tự động kêu tanh tách cực kỳ mượt mà. Hộp đựng như hàng hiệu nước ngoài, đáng tiền 100%!',
    isVerified: true,
    createdAt: new Date(Date.now() - 3600 * 1000 * 48)
  },
  {
    id: 'rev_2',
    productId: 'prod_9',
    userId: 'user_customer',
    userName: 'Hoàng Quân',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    comment: 'Dây chuyền titan sáng bóng, đeo tắm rửa thể thao thoải mái không hề bị đen xỉn hay ngứa da. Rất hài lòng.',
    isVerified: true,
    createdAt: new Date(Date.now() - 3600 * 1000 * 72)
  }
];

const blogs = [
  {
    id: 'blog_1',
    title: '5 Cách Phối Thắt Lưng Da Bò Với Âu Phục Chuẩn Quý Ông Đương Đại',
    slug: '5-cach-phoi-that-lung-da-bo-voi-au-phuc',
    summary: 'Thắt lưng không chỉ giữ trang phục chỉn chu mà còn là điểm nhấn thể hiện đẳng cấp và gu thẩm mỹ tinh tế của người đàn ông thành đạt.',
    content: `
      <h3>1. Quy tắc bất biến: Đồng điệu màu sắc giữa Thắt Lưng và Giày Tây</h3>
      <p>Một trong những nguyên tắc thời trang kinh điển nhưng thường bị lãng quên nhất: Màu của thắt lưng phải luôn hài hòa với màu của đôi giày bạn đang mang. Nếu bạn diện một đôi giày Oxford đen bóng, chiếc thắt lưng da bò Ý màu Black Onyx là sự lựa chọn duy nhất đúng chuẩn.</p>
      
      <h3>2. Độ rộng bản dây lý tưởng cho trang phục Formal</h3>
      <p>Đối với suit hay quần âu công sở, độ rộng bản thắt lưng hoàn hảo nhất nằm trong khoảng từ 3.2cm đến 3.5cm. Bản dây quá to (trên 3.8cm) sẽ mang cảm giác phong cách bụi bặm, thường chỉ phù hợp với quần jeans hoặc kaki thô.</p>

      <h3>3. Khóa tự động mạ titan vs Khóa xỏ kim truyền thống</h3>
      <p>Khóa tự động (Automatic Buckle) mang lại sự tiện lợi vượt bậc khi bạn không cần phải bấm lỗ làm hỏng kết cấu da. Thiết kế mặt khóa trơn phủ PVD titan mờ đem lại vẻ đẹp tối giản, sắc sảo và hiện đại cho các quý ông văn phòng thời đại số.</p>

      <h3>4. Bảo quản bề mặt da sau một ngày dài sử dụng</h3>
      <p>Đừng cuộn tròn thắt lưng quá chặt trong ngăn kéo. Hãy treo thắt lưng thẳng đứng nơi khô ráo, tránh ánh nắng trực tiếp để các thớ da bò tự nhiên được phục hồi độ đàn hồi và không bị nếp gấp.</p>
    `,
    category: 'Phong Cách & Phối Đồ',
    author: 'Tuấn Trần (Fashion Editor)',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
    readTime: '4 phút đọc',
    views: 1820,
    createdAt: new Date('2026-10-15')
  },
  {
    id: 'blog_2',
    title: 'Xu Hướng Kính Mát Phi Công Aviator & Khung Kim Loại Phân Cực 2026',
    slug: 'xu-huong-kinh-mat-phi-cong-aviator-2026',
    summary: 'Chiếc kính râm Aviator huyền thoại quay trở lại mạnh mẽ trong các sàn diễn thời trang quốc tế với tròng phân cực Polarized UV400 và gọng titan siêu nhẹ.',
    content: `
      <h3>1. Di sản vượt thời gian của dòng kính phi công</h3>
      <p>Được phát triển ban đầu dành cho các phi công chiến đấu vào thập niên 1930, kiểu dáng Aviator dáng giọt nước chưa từng lỗi thời trong gần một thế kỷ. Năm 2026, các nhà mốt tái định nghĩa phong cách này bằng khung viền thanh mảnh hơn, tối giản hóa các chi tiết rườm rà.</p>

      <h3>2. Tại sao bạn nhất định phải chọn tròng Polarized UV400?</h3>
      <p>Tia UV và ánh sáng chói phản xạ từ mặt đường nhựa hay kính xe hơi có thể gây mỏi mắt nghiêm trọng. Tròng kính phân cực cao cấp của Atelier không chỉ ngăn chặn 99.9% tia tử ngoại mà còn tăng cường độ tương phản quang học, giúp tầm nhìn luôn trong trẻo và chân thực.</p>

      <h3>3. Cách chọn gọng kính phù hợp với từng khuôn mặt</h3>
      <p>Kính Aviator bo tròn mềm mại là vũ khí đắc lực giúp cân bằng những khuôn mặt góc cạnh (mặt vuông, chữ điền). Nếu bạn sở hữu gương mặt tròn, hãy ưu tiên các mẫu gọng phi công có cầu kính kép ngang dứt khoát.</p>
    `,
    category: 'Xu Hướng Phụ Kiện',
    author: 'Minh Thảo (Stylist)',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80',
    readTime: '5 phút đọc',
    views: 2450,
    createdAt: new Date('2026-10-20')
  },
  {
    id: 'blog_3',
    title: 'Nghệ Thuật Mix & Match Trang Sức Titan Streetwear Cho Giới Trẻ',
    slug: 'nghe-thuat-mix-match-trang-suc-titan-streetwear',
    summary: 'Từ dây chuyền Cuban link to bản đến những chiếc nhẫn họa tiết Aztec, khám phá cách tạo điểm nhấn cá tính mà không bị rườm rà hay phô trương.',
    content: `
      <h3>1. Trang sức titan 316L - Vật liệu vàng của giới mộ điệu</h3>
      <p>Khác với trang sức hợp kim thông thường dễ gỉ sét và gây dị ứng, titan phẫu thuật 316L sở hữu độ bền vĩnh cửu, không phai màu khi tiếp xúc với mồ hôi, nước biển và nước hoa. Độ đầm tay và ánh kim sáng bóng làm nên sức hút đặc biệt.</p>

      <h3>2. Công thức Layering dây chuyền chuẩn phong cách Hip-hop</h3>
      <p>Hãy phối một sợi dây chuyền xích mảnh dài 60cm bên ngoài, kết hợp cùng một sợi Cuban link 7mm ngắn 50cm sát xương quai xanh. Sự chênh lệch về độ dày và chiều dài sẽ tạo nên chiều sâu thị giác cực kỳ lôi cuốn.</p>

      <h3>3. Nguyên tắc “Less is More” khi đeo nhẫn và lắc tay</h3>
      <p>Đừng đeo kín tất cả các ngón tay. Bạn chỉ nên tạo điểm nhấn tối đa 2 chiếc nhẫn trên một bàn tay: Một chiếc bản to ở ngón trỏ hoặc ngón cái, và một chiếc nhẫn trơn mảnh ở ngón áp út đối xứng.</p>
    `,
    category: 'Mẹo Phối Đồ',
    author: 'Hoàng Long (Creative Director)',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
    readTime: '3 phút đọc',
    views: 3100,
    createdAt: new Date('2026-10-24')
  }
];

const stores = [
  {
    id: 'store_1',
    name: 'Flagship Store Bến Thành (TP.HCM)',
    address: '128 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    phone: '028 3822 9999',
    hours: '08:30 - 22:30 (Mở cửa cả tuần)',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.5177583688537!2d106.6894084!3d10.7716003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f39001b972d%3A0xe6ec00155a0f5e1f!2zMTI4IE5ndXnhu4VuIFRyw6NpLCBQaMaw4budbmcgQuG6v24gVGjDoG5oLCBRdeG6rW4gMSwgSOG7kyBDaMOtIE1pbmg!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s'
  },
  {
    id: 'store_2',
    name: 'Showroom Vạn Hạnh Mall (TP.HCM)',
    address: 'Tầng 3 Vạn Hạnh Mall, 11 Sư Vạn Hạnh, Phường 12, Quận 10, TP. Hồ Chí Minh',
    phone: '028 3866 8888',
    hours: '09:30 - 22:00',
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.460831627999!2d106.6652417!3d10.7759714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1b7c3aa07d%3A0xc345f061f03f39a0!2zVuG6oW4gSOG6oW5oIE1hbGw!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s'
  },
  {
    id: 'store_3',
    name: 'Flagship Showroom Tràng Tiền (Hà Nội)',
    address: '45 Phố Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội',
    phone: '024 3936 8888',
    hours: '08:30 - 22:00',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.1673995804646!2d105.8543781!3d21.0253874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135abec2f5c71d9%3A0x2f90117b3531b9d1!2zNDUgVHLDoG5nIFRp4buBbiwgSG_DoG4gS2nhur9tLCBIw6AgTuG7mWk!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s'
  },
  {
    id: 'store_4',
    name: 'Showroom Vincom Bà Triệu (Hà Nội)',
    address: 'Tầng 2 Vincom Center, 191 Bà Triệu, Phường Lê Đại Hành, Quận Hai Bà Trưng, Hà Nội',
    phone: '024 3974 6666',
    hours: '09:30 - 22:00',
    image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.484557921966!2d105.8475253!3d21.0132801!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab88e6e5a1b3%3A0xb5b7fb764d6c4664!2zMTkxIELDoCBUcmnhu4d1LCBIYWkgQsOgIFRyxrBuZywgSMOgIE7hu5lp!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s'
  }
];

module.exports = {
  categories,
  products,
  users,
  orders,
  reviews,
  blogs,
  stores
};

