import defaultAvatar from "../assets/images/default-avatar.png";

/**
 * Helper function để build full URL cho avatar
 * @param avatarUrl - URL của avatar (có thể là relative hoặc absolute)
 * @returns Full URL để hiển thị ảnh
 */
export const getFullAvatarUrl = (avatarUrl: string | null | undefined): string => {
  if (!avatarUrl) return defaultAvatar;
  
  // Nếu đã là full URL (http/https), return luôn
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }
  
  // Nếu là relative path từ backend (/uploads/doctors/xxx.jpg)
  // Thêm base URL của backend
  const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
  return `${API_BASE}${avatarUrl}`;
};

/**
 * Default avatar URL (imported từ assets)
 */
export const DEFAULT_AVATAR_URL = defaultAvatar;

