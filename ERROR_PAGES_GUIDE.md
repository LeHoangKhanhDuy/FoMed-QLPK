# 📄 Hướng dẫn sử dụng Error Pages

## 🎨 Các trang Error đã tạo

### 1. **404 - Not Found Page** (`/404` hoặc bất kỳ route không tồn tại)
- **Mục đích**: Hiển thị khi người dùng truy cập URL không tồn tại
- **Route**: `*` (catch-all route)
- **Component**: `NotFoundPage`
- **Tính năng**:
  - Design đẹp mắt với gradient xanh dương
  - Icon tìm kiếm lớn và số 404 nổi bật
  - Nút "Quay lại" và "Về trang chủ"
  - Links nhanh đến các trang phổ biến (Đặt lịch, Bác sĩ, Chuyên khoa, Trợ giúp)

### 2. **401 - Unauthorized Page** (`/401`)
- **Mục đích**: Hiển thị khi người dùng chưa đăng nhập
- **Route**: `/401`
- **Component**: `UnauthorizedPage`
- **Tính năng**:
  - Design gradient tím/hồng
  - Icon khóa bảo mật
  - Countdown tự động redirect về `/login` sau 5 giây
  - Nút "Đăng nhập ngay" và "Đăng ký tài khoản"
  - Hiển thị lợi ích khi đăng nhập (Đặt lịch nhanh, Quản lý lịch hẹn, Xem kết quả khám)
  - Lưu URL hiện tại để redirect sau khi login

### 3. **403 - Forbidden Page** (`/403`)
- **Mục đích**: Hiển thị khi người dùng không có quyền truy cập
- **Route**: `/403`
- **Component**: `ForbiddenPage`
- **Tính năng**:
  - Design gradient đỏ/cam
  - Icon shield alert
  - Thông báo yêu cầu phân quyền
  - Nút "Quay lại" và "Về trang chủ"
  - Links liên hệ hỗ trợ và đăng nhập lại

### 4. **500 - Server Error Page** (`/500`)
- **Mục đích**: Hiển thị khi có lỗi server
- **Route**: `/500`
- **Component**: `ServerErrorPage`
- **Tính năng**:
  - Design gradient cam/vàng
  - Icon server crash
  - Nút "Thử lại" với animation loading
  - Thông tin an ủi người dùng
  - Links kiểm tra trạng thái hệ thống

### 5. **Maintenance Page** (`/maintenance`)
- **Mục đích**: Hiển thị khi hệ thống đang bảo trì
- **Route**: `/maintenance`
- **Component**: `MaintenancePage`
- **Tính năng**:
  - Design gradient cyan/xanh dương
  - Icon công cụ với animation pulse
  - Hiển thị thời gian dự kiến hoàn thành
  - Đồng hồ real-time
  - Danh sách cải tiến mới
  - Thông tin liên hệ khẩn cấp

---

## 🔧 Cách sử dụng

### Trong Component:
```tsx
import { useNavigate } from "react-router-dom";

function MyComponent() {
  const navigate = useNavigate();

  // Redirect đến error page
  navigate("/404");  // Not Found
  navigate("/401");  // Unauthorized
  navigate("/403");  // Forbidden
  navigate("/500");  // Server Error
  navigate("/maintenance");  // Maintenance
}
```

### Trong Axios Interceptor:
```tsx
// Đã được tích hợp trong src/services/http.ts
authHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto redirect to /401
      window.location.href = "/401";
    }
    if (error.response?.status === 403) {
      window.location.href = "/403";
    }
    if (error.response?.status === 500) {
      window.location.href = "/500";
    }
    return Promise.reject(error);
  }
);
```

### Programmatic Navigation:
```tsx
// Trong error boundary hoặc catch block
try {
  await someAPICall();
} catch (error) {
  if (error.response?.status === 500) {
    navigate("/500");
  }
}
```

---

## 🎨 Customization

### Thay đổi màu sắc:
Mỗi page sử dụng gradient riêng, có thể tùy chỉnh trong `className`:
```tsx
// NotFoundPage - Xanh dương
bg-gradient-to-br from-blue-50 via-white to-blue-50

// UnauthorizedPage - Tím/Hồng
bg-gradient-to-br from-purple-50 via-white to-pink-50

// ForbiddenPage - Đỏ/Cam
bg-gradient-to-br from-red-50 via-white to-orange-50

// ServerErrorPage - Cam/Vàng
bg-gradient-to-br from-orange-50 via-white to-yellow-50

// MaintenancePage - Cyan/Xanh
bg-gradient-to-br from-cyan-50 via-white to-blue-50
```

### Thay đổi icon:
```tsx
import { NewIcon } from "lucide-react";

<NewIcon className="w-20 h-20 text-blue-500 mx-auto" />
```

### Thêm custom content:
```tsx
<div className="mt-8">
  {/* Your custom content here */}
</div>
```

---

## 📊 Routes trong App.tsx

```tsx
// ERROR PAGES
<Route path="/401" element={<UnauthorizedPage />} />
<Route path="/403" element={<ForbiddenPage />} />
<Route path="/500" element={<ServerErrorPage />} />
<Route path="/maintenance" element={<MaintenancePage />} />
<Route path="*" element={<NotFoundPage />} />  // Catch-all for 404
```

---

## 🔒 Tích hợp với Authentication

### RequireCMSRole:
```tsx
// src/auth/RequireCMSRole.tsx
if (!user) return <Navigate to="/401" replace state={{ from: loc }} />;
if (!ok) return <Navigate to="/403" replace />;
```

### HTTP Interceptor:
```tsx
// src/services/http.ts
authHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // CMS users: Show warning, keep session
      // Regular users: Logout and redirect to /401
    }
    return Promise.reject(error);
  }
);
```

---

## ✨ Best Practices

1. **Luôn cung cấp cách quay lại**: Mọi error page đều có nút "Quay lại" và "Về trang chủ"

2. **Thông báo rõ ràng**: Giải thích lý do lỗi và hướng giải quyết

3. **Branding nhất quán**: Sử dụng màu sắc và typography phù hợp với brand

4. **Mobile responsive**: Tất cả pages đều responsive với `sm:`, `md:` breakpoints

5. **Accessibility**: Sử dụng semantic HTML và ARIA labels khi cần

6. **User-friendly**: Không làm người dùng hoang mang, luôn cung cấp next steps

---

## 🧪 Testing

### Test 404:
```
1. Truy cập URL không tồn tại: http://localhost:5173/asdfasdf
2. Kiểm tra hiển thị NotFoundPage
3. Test các nút navigation
```

### Test 401:
```
1. Logout
2. Truy cập trang yêu cầu auth: /user/profile
3. Hoặc visit trực tiếp: http://localhost:5173/401
4. Kiểm tra countdown redirect
```

### Test 403:
```
1. Login với tài khoản không có quyền CMS
2. Truy cập: /cms/dashboard
3. Kiểm tra redirect đến ForbiddenPage
```

### Test 500:
```
1. Visit trực tiếp: http://localhost:5173/500
2. Hoặc trigger lỗi server trong API call
3. Test nút "Thử lại"
```

### Test Maintenance:
```
1. Visit: http://localhost:5173/maintenance
2. Kiểm tra countdown timer
3. Kiểm tra danh sách cải tiến
```

---

## 📝 File Structure

```
src/pages/Error/
├── index.ts                    # Export tất cả pages
├── NotFoundPage.tsx           # 404 Error
├── UnauthorizedPage.tsx       # 401 Error
├── ForbiddenPage.tsx          # 403 Error
├── ServerErrorPage.tsx        # 500 Error
└── MaintenancePage.tsx        # Maintenance Mode
```

---

## 🚀 Future Enhancements

1. **Error Tracking**: Tích hợp Sentry hoặc Google Analytics
2. **Custom Messages**: Cho phép pass custom message qua route state
3. **Animations**: Thêm Framer Motion cho transitions mượt hơn
4. **Dark Mode**: Support dark mode theme
5. **Localization**: Hỗ trợ đa ngôn ngữ (tiếng Anh, tiếng Việt)

---

## 📞 Support

Nếu có vấn đề với error pages, vui lòng liên hệ:
- Email: support@fomed.vn
- Phone: 1900 xxxx

---

**Created**: October 2024  
**Version**: 1.0.0  
**Author**: FoMed Development Team

