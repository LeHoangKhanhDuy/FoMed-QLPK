// src/utils/http.ts
import axios from "axios";
import toast from "react-hot-toast";

export const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/+$/,
  ""
);

export const publicHttp = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export const authHttp = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// dùng đúng KEY bạn đang lưu token
const USER_TOKEN_KEY = "userToken";
const AUTH_USER_KEY = "auth_user";

// Request interceptor: Thêm token vào mọi request
authHttp.interceptors.request.use((config) => {
  const token = localStorage.getItem(USER_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: Xử lý lỗi 401 - Token hết hạn
authHttp.interceptors.response.use(
  (response) => response, // Success - không làm gì
  (error) => {
    if (error.response?.status === 401) {
      // Lấy message từ response
      const errorMessage = error.response?.data?.message || "";
      
      // Kiểm tra xem có phải lỗi "user chưa có Patient record" không
      const isNoPatientRecord = errorMessage.includes("Không xác định được bệnh nhân");
      
      if (isNoPatientRecord) {
        // User chưa có hồ sơ bệnh nhân - KHÔNG logout, chỉ log warning
        console.warn("⚠️ User chưa có hồ sơ bệnh nhân:", errorMessage);
        // Để component tự xử lý hiển thị message
        return Promise.reject(error);
      }
      
      // Token thật sự hết hạn hoặc không hợp lệ - Logout và redirect
      console.warn("⚠️ Token hết hạn (401 Unauthorized)");
      
      // Clear tất cả auth data
      localStorage.removeItem(USER_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userRefreshToken");
      
      // Dispatch event để AuthProvider biết và clear state
      window.dispatchEvent(new Event("auth:logout"));
      
      // Show toast thông báo
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", {
        duration: 2000,
      });
      
      // Redirect về trang chủ sau 300ms
      setTimeout(() => {
        window.location.href = "/";
      }, 300);
    }

    return Promise.reject(error);
  }
);
