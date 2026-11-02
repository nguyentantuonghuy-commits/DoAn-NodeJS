const nodemailer = require('nodemailer');

/**
 * Service gửi email thực tế qua Gmail SMTP sử dụng Google App Password
 */
class EmailService {
  getTransporter() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      throw new Error('Chưa cấu hình EMAIL_USER và EMAIL_PASS trong file .env');
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user.trim(),
        pass: pass.trim().replace(/\s+/g, '')
      }
    });
  }

  /**
   * Gửi mã OTP 6 số qua email thực tế
   * @param {string} toEmail Email người nhận
   * @param {string} userName Tên người dùng
   * @param {string} otp Mã OTP 6 chữ số
   */
  async sendPasswordResetOTP(toEmail, userName, otp) {
    const transporter = this.getTransporter();

    // Template HTML thương hiệu thời trang cao cấp Atelier
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background-color: #0F172A; padding: 28px 24px; text-align: center; border-bottom: 2px solid #D97706;">
          <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; letter-spacing: 3px; font-weight: 800;">ATELIER</h1>
          <p style="margin: 4px 0 0; color: #D97706; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Contemporary Accessories</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 28px; color: #1E293B; line-height: 1.6;">
          <h2 style="margin-top: 0; font-size: 20px; color: #0F172A;">Yêu Cầu Khôi Phục Mật Khẩu</h2>
          <p>Xin chào <strong>${userName || 'Quý khách'}</strong>,</p>
          <p>Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với địa chỉ email <strong>${toEmail}</strong> tại Atelier Accessories.</p>
          <p>Vui lòng sử dụng mã xác nhận (OTP) gồm 6 chữ số dưới đây để tiếp tục:</p>

          <!-- OTP Box -->
          <div style="margin: 28px 0; text-align: center;">
            <div style="display: inline-block; background-color: #F8FAFC; border: 2px dashed #D97706; border-radius: 8px; padding: 14px 32px;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0F172A; font-family: monospace;">${otp}</span>
            </div>
            <p style="margin-top: 10px; font-size: 12px; color: #64748B;">Mã xác thực có hiệu lực trong vòng <strong>10 phút</strong>.</p>
          </div>

          <div style="background-color: #FEF3C7; border-left: 4px solid #D97706; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #92400E; margin-bottom: 24px;">
            <strong>Lưu ý bảo mật:</strong> Tuyệt đối không chia sẻ mã này cho bất kỳ ai. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email và tài khoản của bạn vẫn an toàn.
          </div>

          <p style="margin-bottom: 0; font-size: 14px; color: #475569;">Trân trọng,<br><strong>Đội ngũ Atelier Accessories Support</strong></p>
        </div>

        <!-- Footer -->
        <div style="background-color: #F8FAFC; padding: 18px 24px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 12px; color: #94A3B8;">
          <p style="margin: 0;">Hotline CSKH: 1900 8888 | Email: support@atelier.vn</p>
          <p style="margin: 4px 0 0;">&copy; 2026 Atelier Accessories. All rights reserved.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Atelier Accessories" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `[Atelier Accessories] Mã xác thực khôi phục mật khẩu: ${otp}`,
      html: htmlContent
    });

    console.log(`[EmailService] Đã gửi mã OTP thực tế tới email ${toEmail}! MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  }
}

module.exports = new EmailService();
