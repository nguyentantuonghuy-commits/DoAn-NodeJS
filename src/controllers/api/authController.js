const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dbStore = require('../../services/dbStore');
const { JWT_SECRET } = require('../../middleware/auth');

const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const existingUser = dbStore.findUserByEmail(email);
    if (existingUser) {
      if (existingUser.authProvider === 'google' || existingUser.googleId) {
        return res.status(409).json({
          success: false,
          isGoogleAccount: true,
          message: 'Email này đã được liên kết với tài khoản Google. Vui lòng bấm vào nút "Đăng Nhập Bằng Google" bên dưới để tiếp tục mua sắm.'
        });
      }
      return res.status(409).json({
        success: false,
        message: 'Địa chỉ email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng chức năng quên mật khẩu.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = dbStore.createUser({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      address: address || '',
      role: 'user',
      status: 'active',
      authProvider: 'local'
    });

    // Auto-link any previous guest orders matching this email or phone
    try {
      const allOrders = dbStore.getAllOrders();
      let linkedCount = 0;
      allOrders.forEach(ord => {
        if (!ord.userId) {
          const matchEmail = email && ord.customerEmail && ord.customerEmail.toLowerCase().trim() === email.toLowerCase().trim();
          const matchPhone = phone && ord.customerPhone && ord.customerPhone.replace(/[^\d]/g, '') === String(phone).replace(/[^\d]/g, '');
          if (matchEmail || matchPhone) {
            ord.userId = newUser.id;
            linkedCount++;
          }
        }
      });
      if (linkedCount > 0) {
        dbStore.saveToFile();
      }
    } catch (e) {
      console.warn('Auto-link orders warning:', e.message);
    }

    const token = signToken(newUser.id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    const { password: _, ...userWithoutPass } = newUser;
    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      data: {
        user: userWithoutPass,
        token
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đăng ký', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = dbStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác.'
      });
    }

    // CHECK: If user registered via Google and has no local password
    if ((user.authProvider === 'google' || user.googleId) && (!user.password || user.password === '')) {
      return res.status(400).json({
        success: false,
        isGoogleAccount: true,
        message: 'Tài khoản này được đăng ký thông qua Google và chưa tạo mật khẩu riêng. Vui lòng bấm vào nút "Đăng Nhập Bằng Google" bên dưới để đăng nhập nhanh.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // If user has Google linked, provide helpful guidance
      if (user.authProvider === 'google' || user.googleId) {
        return res.status(401).json({
          success: false,
          isGoogleAccount: true,
          message: 'Mật khẩu không chính xác. Tài khoản này có liên kết Google, bạn có thể bấm "Đăng Nhập Bằng Google" để truy cập ngay mà không cần mật khẩu.'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác.'
      });
    }

    if (user.status === 'locked') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ bộ phận hỗ trợ.'
      });
    }

    // Update lastLogin timestamp
    dbStore.updateUser(user.id, { lastLogin: new Date() });

    const token = signToken(user.id);

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    const { password: _, ...userWithoutPass } = user;
    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        user: userWithoutPass,
        token
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đăng nhập', error: error.message });
  }
};

// @desc    Initiate Real Google OAuth 2.0 Web Flow (Redirects to Google)
// @route   GET /api/auth/google
const googleAuthRedirect = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId.includes('YOUR_GOOGLE') || clientSecret.includes('YOUR_GOOGLE')) {
    return res.redirect('/login?error=' + encodeURIComponent('Chưa cấu hình GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong file .env. Vui lòng thiết lập thông tin từ Google Cloud Console.'));
  }

  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  const defaultCallback = `${protocol}://${host}/api/auth/google/callback`;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || defaultCallback;

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account' // Forces Google to show account selection (current account or another account)
  });

  return res.redirect(`${rootUrl}?${params.toString()}`);
};

// @desc    Handle Real Google OAuth 2.0 Callback
// @route   GET /api/auth/google/callback
const googleAuthCallback = async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      return res.redirect('/login?error=' + encodeURIComponent('Bạn đã hủy hoặc từ chối đăng nhập bằng Google.'));
    }

    if (!code) {
      return res.redirect('/login?error=' + encodeURIComponent('Không nhận được mã xác thực (code) từ máy chủ Google.'));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const defaultCallback = `${protocol}://${host}/api/auth/google/callback`;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || defaultCallback;

    // 1. Exchange authorization code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error || !tokenData.access_token) {
      console.error('[Google OAuth Token Error]:', tokenData);
      return res.redirect('/login?error=' + encodeURIComponent('Xác thực thất bại với Google: ' + (tokenData.error_description || tokenData.error)));
    }

    // 2. Fetch user profile from Google UserInfo endpoint
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const profile = await profileRes.json();

    if (!profile || !profile.email) {
      return res.redirect('/login?error=' + encodeURIComponent('Không thể đọc thông tin email từ tài khoản Google của bạn.'));
    }

    const email = profile.email.toLowerCase().trim();
    let user = dbStore.findUserByEmail(email);
    if (!user && profile.sub) {
      user = dbStore.findUserByGoogleId(profile.sub);
    }

    if (user) {
      // If user account is locked by admin
      if (user.status === 'locked') {
        return res.redirect('/login?locked=1');
      }

      const updates = {
        lastLogin: new Date(),
        authProvider: 'google',
        googleId: profile.sub || user.googleId,
        emailVerified: true
      };
      if (profile.picture && (!user.avatar || user.avatar.startsWith('data:image/svg+xml') || user.avatar.includes('unsplash.com'))) {
        updates.avatar = profile.picture;
      }
      user = dbStore.updateUser(user.id, updates);
    } else {
      // Register new user from Google
      const { generateInitialsAvatar } = require('../../utils/avatarHelper');
      const defaultAvatar = profile.picture || generateInitialsAvatar(profile.name || email);

      user = dbStore.createUser({
        name: profile.name || email.split('@')[0],
        email: email,
        password: '',
        role: 'user',
        status: 'active',
        authProvider: 'google',
        googleId: profile.sub,
        avatar: defaultAvatar,
        phone: '',
        address: '',
        emailVerified: true,
        lastLogin: new Date(),
        createdAt: new Date()
      });

      // Auto-link previous guest orders matching this email
      try {
        const allOrders = dbStore.getAllOrders();
        let linkedCount = 0;
        allOrders.forEach(ord => {
          if (!ord.userId && ord.customerEmail && ord.customerEmail.toLowerCase().trim() === email) {
            ord.userId = user.id;
            linkedCount++;
          }
        });
        if (linkedCount > 0) dbStore.saveToFile();
      } catch (e) {
        console.warn('[Google Auth Callback] Auto-link orders warning:', e.message);
      }
    }

    // 3. Issue JWT Token and set cookie
    const token = signToken(user.id);
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    if (user.role === 'admin') {
      return res.redirect('/admin');
    }
    return res.redirect('/profile');
  } catch (err) {
    console.error('[Google Callback Exception]:', err);
    return res.redirect('/login?error=' + encodeURIComponent('Lỗi hệ thống máy chủ khi xử lý phản hồi từ Google.'));
  }
};

// @desc    Google OAuth Sign-in & Sign-up (via client-side token or manual payload)
// @route   POST /api/auth/google
const googleAuth = async (req, res) => {
  try {
    const { credential, email, name, googleId, avatar } = req.body;
    let googleUser = null;

    // 1. If Google GIS credential (JWT ID Token) is provided
    if (credential) {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
          const payload = JSON.parse(payloadJson);
          if (payload && payload.email) {
            googleUser = {
              googleId: payload.sub,
              email: payload.email.toLowerCase().trim(),
              name: payload.name || payload.email.split('@')[0],
              avatar: payload.picture || '',
              emailVerified: payload.email_verified !== false
            };
          }
        }
      } catch (err) {
        console.warn('[Google Auth] Could not decode GIS JWT, falling back to payload:', err.message);
      }
    }

    // 2. Direct payload fallback (for testing/demo or custom integration)
    if (!googleUser && email) {
      googleUser = {
        googleId: googleId || `google_${Date.now()}`,
        email: email.toLowerCase().trim(),
        name: name || email.split('@')[0],
        avatar: avatar || '',
        emailVerified: true
      };
    }

    if (!googleUser || !googleUser.email) {
      return res.status(400).json({
        success: false,
        message: 'Thông tin xác thực Google không hợp lệ hoặc thiếu email.'
      });
    }

    // 3. Find if user exists by email or googleId
    let user = dbStore.findUserByEmail(googleUser.email);
    if (!user && googleUser.googleId) {
      user = dbStore.findUserByGoogleId(googleUser.googleId);
    }

    if (user) {
      // Check if user is locked
      if (user.status === 'locked') {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên. Vui lòng liên hệ bộ phận hỗ trợ.'
        });
      }

      // Link googleId and update provider/avatar if appropriate
      const updates = {
        lastLogin: new Date(),
        authProvider: user.authProvider || 'google',
        googleId: user.googleId || googleUser.googleId
      };
      if (googleUser.avatar && (!user.avatar || user.avatar.startsWith('data:image/svg+xml') || user.avatar.includes('unsplash.com'))) {
        updates.avatar = googleUser.avatar;
      }
      user = dbStore.updateUser(user.id, updates);
    } else {
      // 4. Create new user for first-time Google sign-in
      const { generateInitialsAvatar } = require('../../utils/avatarHelper');
      const defaultAvatar = googleUser.avatar || generateInitialsAvatar(googleUser.name);

      user = dbStore.createUser({
        name: googleUser.name,
        email: googleUser.email,
        password: '',
        role: 'user',
        status: 'active',
        authProvider: 'google',
        googleId: googleUser.googleId,
        avatar: defaultAvatar,
        phone: '',
        address: '',
        emailVerified: true,
        lastLogin: new Date(),
        createdAt: new Date()
      });

      // Auto-link previous guest orders matching this email
      try {
        const allOrders = dbStore.getAllOrders();
        let linkedCount = 0;
        allOrders.forEach(ord => {
          if (!ord.userId && ord.customerEmail && ord.customerEmail.toLowerCase().trim() === googleUser.email.toLowerCase().trim()) {
            ord.userId = user.id;
            linkedCount++;
          }
        });
        if (linkedCount > 0) {
          dbStore.saveToFile();
        }
      } catch (e) {
        console.warn('[Google Auth] Auto-link orders warning:', e.message);
      }
    }

    // 5. Issue JWT and Set Cookie
    const token = signToken(user.id);
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    const { password: _, ...userWithoutPass } = user;
    return res.status(200).json({
      success: true,
      message: `Xin chào ${user.name}! Đăng nhập Google thành công.`,
      data: {
        user: userWithoutPass,
        token
      }
    });
  } catch (error) {
    console.error('[Google Auth Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi đăng nhập qua Google',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({
    success: true,
    message: 'Đăng xuất thành công!'
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = (req, res) => {
  const { password: _, ...userWithoutPass } = req.user;
  return res.status(200).json({
    success: true,
    data: userWithoutPass
  });
};

// @desc    Change password
// @route   PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có tối thiểu 6 ký tự.'
      });
    }

    const user = dbStore.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    // Nếu tài khoản đăng nhập thông qua Google SSO
    if (user.authProvider === 'google' || user.googleId) {
      return res.status(400).json({
        success: false,
        isGoogleAccount: true,
        message: 'Tài khoản của bạn đăng nhập và được bảo vệ thông qua Google (không dùng mật khẩu trên hệ thống Atelier). Bạn vui lòng quản lý và đổi mật khẩu trực tiếp trên Google.'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không chính xác.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    dbStore.updateUser(user.id, { password: hashedPassword });

    return res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công!'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// In-memory OTP storage for password reset: email -> { otp, expiresAt, attempts }
const otpStore = new Map();

// @desc    Request Password Reset (Sends 6-digit OTP to Email)
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp địa chỉ email hợp lệ.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = dbStore.findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản nào khớp với địa chỉ email này. Vui lòng kiểm tra lại chính tả hoặc đăng ký tài khoản mới.'
      });
    }

    // Kiểm tra tài khoản có bị khóa không
    if (user.status === 'locked') {
      return res.status(403).json({
        success: false,
        isLocked: true,
        message: 'Tài khoản của bạn hiện đang bị tạm khóa. Vui lòng liên hệ bộ phận hỗ trợ Atelier để được hỗ trợ mở khóa.'
      });
    }

    // Nếu tài khoản được tạo hoặc liên kết thông qua Google SSO
    if (user.authProvider === 'google' || user.googleId) {
      return res.status(400).json({
        success: false,
        isGoogleAccount: true,
        message: 'Tài khoản của bạn được đăng nhập và bảo mật thông qua Google (không sử dụng mật khẩu trên hệ thống Atelier). Bạn chỉ cần bấm nút "Đăng Nhập Bằng Google" bên dưới để vào tài khoản. Nếu bạn quên mật khẩu Google, vui lòng khôi phục trực tiếp tại Google (accounts.google.com).'
      });
    }

    // Sinh mã ngẫu nhiên 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu mã vào bộ nhớ với thời hạn 10 phút
    otpStore.set(normalizedEmail, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0
    });

    // Gửi email qua EmailService
    const emailService = require('../../services/emailService');
    await emailService.sendPasswordResetOTP(user.email, user.name, otp);

    return res.status(200).json({
      success: true,
      message: 'Mã xác nhận 6 số đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư (kể cả mục Spam).'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xử lý yêu cầu quên mật khẩu',
      error: error.message
    });
  }
};

// @desc    Verify 6-digit OTP and Issue JWT Reset Token
// @route   POST /api/auth/verify-reset-otp
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email và mã xác nhận OTP.'
      });
    }

    const storedData = otpStore.get(email.toLowerCase());
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy yêu cầu đặt lại mật khẩu hoặc mã đã hết hạn. Vui lòng gửi lại yêu cầu.'
      });
    }

    // Kiểm tra hết hạn (10 phút)
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: 'Mã xác nhận OTP đã hết hạn (quá 10 phút). Vui lòng yêu cầu mã mới.'
      });
    }

    // Kiểm tra số lần nhập sai (giới hạn 5 lần)
    if (storedData.attempts >= 5) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: 'Bạn đã nhập sai mã OTP quá 5 lần. Vui lòng yêu cầu mã mới để đảm bảo an toàn.'
      });
    }

    if (storedData.otp !== otp.trim()) {
      storedData.attempts += 1;
      const remaining = 5 - storedData.attempts;
      return res.status(400).json({
        success: false,
        message: `Mã xác nhận OTP không chính xác. Bạn còn ${remaining} lần thử.`
      });
    }

    // OTP chính xác -> Xóa mã đã dùng khỏi store
    otpStore.delete(email.toLowerCase());

    const user = dbStore.findUserByEmail(email);

    // Ký JWT Reset Token chuyên dụng có hạn trong 15 phút
    const resetToken = jwt.sign(
      {
        id: user ? user.id : null,
        email: email.toLowerCase(),
        purpose: 'password_reset'
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.status(200).json({
      success: true,
      message: 'Xác thực mã OTP thành công! Vui lòng tạo mật khẩu mới.',
      resetToken
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực mã OTP',
      error: error.message
    });
  }
};

// @desc    Reset Password with verified JWT Reset Token
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã xác thực token và mật khẩu mới.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có độ dài tối thiểu 6 ký tự.'
      });
    }

    // Verify JWT Reset Token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
      if (decoded.purpose !== 'password_reset') {
        return res.status(400).json({
          success: false,
          message: 'Token không hợp lệ cho tác vụ đặt lại mật khẩu.'
        });
      }
    } catch (jwtError) {
      return res.status(400).json({
        success: false,
        message: 'Phiên đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng thực hiện lại từ đầu.'
      });
    }

    const user = dbStore.findUserByEmail(decoded.email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Tài khoản người dùng không còn tồn tại trên hệ thống.'
      });
    }

    // Mã hóa mật khẩu mới bằng bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật vào DB
    dbStore.updateUser(user.id, { password: hashedPassword });

    return res.status(200).json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bằng mật khẩu mới.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật mật khẩu mới',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  googleAuthRedirect,
  googleAuthCallback,
  googleAuth,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  verifyResetOTP,
  resetPassword
};

