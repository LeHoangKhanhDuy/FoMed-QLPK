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

// Response interceptor: Xử lý lỗi 401 thông minh
authHttp.interceptors.response.use(
  (response) => response, // Success - không làm gì
  (error) => {
    if (error.response?.status === 401) {
      // Kiểm tra xem user có role CMS không
      const authUserRaw = localStorage.getItem(AUTH_USER_KEY);
      let shouldLogout = true;

      if (authUserRaw) {
        try {
          const authUser = JSON.parse(authUserRaw);
          const cmsRoles = ["ADMIN", "DOCTOR", "EMPLOYEE"];
          const hasCmsRole = Array.isArray(authUser.roles) && 
            authUser.roles.some((r: string) => cmsRoles.includes(r.toUpperCase()));

          // Nếu là CMS user và đang ở trang CMS, KHÔNG tự động logout
          if (hasCmsRole && window.location.pathname.startsWith("/cms")) {
            shouldLogout = false;
            console.warn("⚠️ Token hết hạn nhưng giữ session cho CMS user");
            
            // Chỉ hiển thị warning, không logout
            if (!document.querySelector('.toast-401-warning')) {
              toast.error(
                "Phiên làm việc sắp hết hạn. Vui lòng lưu công việc của bạn.",
                {
                  duration: 5000,
                  className: 'toast-401-warning'
                }
              );
            }
          }
        } catch (e) {
          console.error("Error parsing auth user:", e);
        }
      }

      // Nếu không phải CMS user hoặc không ở trang CMS, logout
      if (shouldLogout) {
        localStorage.removeItem(USER_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem("userInfo");
        
        toast.error("Phiên đăng nhập đã hết hạn!");
        
        // Redirect to 401 page
        setTimeout(() => {
          if (!window.location.pathname.includes("/401")) {
            window.location.href = "/401";
          }
        }, 1000);
      }
    }

    return Promise.reject(error);
  }
);
