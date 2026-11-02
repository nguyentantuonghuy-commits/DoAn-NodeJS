/**
 * Helper sinh avatar chữ cái mặc định (Initials Avatar) phong cách sang trọng Atelier
 */
const getInitials = (name = 'User') => {
  if (!name) return 'AT';
  const cleanName = name.replace(/\([^)]*\)/g, '').trim(); // Bỏ các hậu tố trong ngoặc như (Khách hàng), (Admin)
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AT';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  // Lấy chữ cái đầu của 2 từ đầu tiên (Ví dụ: "Nguyễn Tấn Tường Huy" -> "NT")
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const generateInitialsAvatar = (name) => {
  const initials = getInitials(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#avatarGrad)"/>
  <circle cx="100" cy="100" r="92" fill="none" stroke="#D97706" stroke-width="4"/>
  <text x="50%" y="54%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="76" font-weight="800" fill="#F59E0B" text-anchor="middle" dominant-baseline="middle" letter-spacing="3">${initials}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

module.exports = {
  getInitials,
  generateInitialsAvatar
};
