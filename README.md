![](https://user-images.githubusercontent.com/8027137/181298835-99af5b55-6fa6-45fc-9519-5b3e3eebf403.png)

# 🏥 FoMed - Quản lý phòng khám (Frontend)

> Ứng dụng React + TypeScript kết nối với API để người dùng đặt lịch, xem bác sĩ và CMS nội bộ xử lý dịch vụ.

## 🚀 Khởi động nhanh (Quick Start)

```bash
# Cài đặt thư viện cần thiết
npm install

# Chạy môi trường phát triển (hot reload)
npm run dev

# Tạo bản build tối ưu cho production
npm run build

# Xem thử bản build sản xuất
npm run preview
```

## 📚 Tài liệu kèm theo

- **Đọc chi tiết**: [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md)
- **Nội dung nổi bật**: Service Manager, Authentication, Booking, Dashboard, Testing Guide, Error Pages

## 🎯 Tính năng chính

### ✅ Đã hoàn thiện

- ✅ Hiển thị danh sách bác sĩ theo chuyên khoa, rating, lượt khám, link Chi tiết/Đặt lịch.
- ✅ Booking gói dịch vụ/bác sĩ với form chuyển hướng nhanh.
- ✅ Component `DoctorRelated` tự điều chỉnh và thông báo khi không có bác sĩ cùng chuyên khoa.
- ✅ Service Manager trong CMS: CRUD dịch vụ, upload ảnh, định dạng giá theo chuẩn VND (5.000.000).
- ✅ Quản lý vai trò người dùng (ADMIN/DOCTOR/EMPLOYEE) với phân quyền rõ ràng.
- ✅ Chuẩn hóa session JWT, CMS giữ trạng thái đăng nhập, public auto logout.
- ✅ Pages lỗi 404/403/500 chuyên nghiệp, responsive toàn bộ app.
- ✅ Các modal xác nhận, toast thông báo và skeleton loading cho UX mượt mà.

### ⏳ Đang phát triển

- ⏳ Upload endpoint backend cho hình ảnh dịch vụ.
- ⏳ Nén ảnh phía client trước khi gửi.
- ⏳ Kéo thả (drag & drop) nhiều ảnh.
- ⏳ Hỗ trợ nhiều ảnh trên cùng một dịch vụ.

## 🛠️ Công nghệ & thư viện

| Thành phần   | Công cụ               |
| ------------ | --------------------- |
| Framework    | React 18 + TypeScript |
| Build        | Vite                  |
| Kiểu dáng    | TailwindCSS           |
| UI/Modal     | Headless UI           |
| Icons        | Lucide React          |
| HTTP         | Axios + Interceptors  |
| Router       | React Router v6       |
| Notification | React Hot Toast       |

## 📁 Cấu trúc thư mục chính

```
src/
├── component/              # Component UI theo domain (Auth, Booking, Admin, Doctor...)
├── services/               # Axios + API helper (auth, doctor, booking...)
├── pages/                  # Các route chính (Home, Doctor, CMS...)
├── contexts/               # Context provider nội bộ (UserContext)
├── hooks/                  # Custom hooks (useUser, useUserProfile...)
├── layouts/                # Layout cho CMS, người dùng, doctor
└── Utils/                  # Utilities (formatVND, avatar, mask phone...)
```

## 🌐 Biến môi trường cần thiết

Tạo file `.env` ở gốc:

```bash
VITE_API_BASE_URL=https://api.fomed.local
```

## 🔐 Vai trò & quyền truy cập

| Vai trò    | Quyền                                                         |
| ---------- | ------------------------------------------------------------- |
| `ADMIN`    | Toàn quyền CMS (dịch vụ, user, hóa đơn, đơn thuốc, dashboard) |
| `DOCTOR`   | Xem lịch khám, workspace, đơn thuốc, bệnh nhân tự quản        |
| `EMPLOYEE` | Xử lý lịch hẹn, xem hóa đơn, read-only CMS nào được cấp       |
| `PATIENT`  | Truy cập trang người dùng công khai, đặt lịch, xem lịch sử    |

## 📊 Chi tiết tính năng

1. **Service Manager (`/cms/service-manager`)**

   - CRUD dịch vụ y tế (tên, chuyên khoa, giá, mô tả).
   - Upload ảnh (kéo thả, preview) và hiển thị preview khi chọn.
   - Định dạng giá theo chuẩn VND (5.000.000) trực tiếp khi nhập.
   - Search, filter và phân trang giúp tìm nhanh dịch vụ.

2. **Booking & Home**

   - Giao diện hiển thị gói dịch vụ, bác sĩ nổi bật, tính năng tìm chuyên khoa.
   - Component `DoctorRelated` tự động lấy dữ liệu liên quan và xuất thông báo khi trống.
   - Form đặt lịch chuyển hướng sang `/booking` với tham số `doctorId` hoặc `packageId`.

3. **Authentication**

   - JWT + refresh token (CMS lưu trữ trong session, public auto logout).
   - Login/Signup xử lý validation và thông báo lỗi cụ thể.
   - CMS có modal xác nhận khi thao tác (delete, approve, cancel).

4. **Error Handling & UX**
   - Clear 404/403/500 pages.
   - Skeleton loading trong các component nhỏ với animation.
   - Toast hoặc modal hiển thị kết quả thao tác.

## 🧭 Hướng dẫn sử dụng nền tảng (UI)

1. Tại trang chính, search theo tên bác sĩ/chuyên khoa và chọn bộ lọc (chuyên khoa, rating).
2. Xem card bác sĩ để kiểm tra rating, lượt khám, kinh nghiệm; dùng nút `Chi tiết` hoặc `Đặt lịch`.
3. Khi đăng nhập `CMS`, vào `/cms` để quản lý dịch vụ, hóa đơn và lịch khám theo vai trò.
4. Kiểm tra modal xác nhận khi thao tác xóa/cập nhật, toast hiển thị thông báo thành công/lỗi.
5. Trong trường hợp không tìm được bác sĩ cùng chuyên khoa, phần `Bác sĩ cùng chuyên khoa` vẫn hiện và báo "Không có bác sĩ nào cùng chuyên khoa".

## 🧪 Kiểm thử nhanh

```bash
1. npm run dev -> mở localhost
2. Đăng nhập ADMIN (thông qua form auth)
3. Truy cập /cms/service-manager, thêm dịch vụ kèm ảnh
4. Quay ra trang public, tìm bác sĩ, đặt lịch thử
5. Kiểm tra tab console/network nếu xảy ra lỗi
```

## 🐛 Những vấn đề đang chú ý

1. File upload chỉ preview local, cần backend endpoint thật.
2. Chưa validate kích thước/file type trước khi upload.
3. Chưa có chức năng bulk action (xóa hàng loạt).

## 🚀 Đưa lên môi trường sản xuất

### Trên Vercel

```bash
1. Đặt VITE_API_BASE_URL
2. vercel --prod
3. Kiểm tra CORS và env trên backend
```

### Trên các nền tảng khác

```bash
1. npm run build
2. Upload thư mục dist
3. Cấu hình env và CORS
```

## 📝 Lịch sử thay đổi (Changelog)

### v2.0.0 (2025-01-25)

- ✅ Hoàn thành Service Manager
- ✅ Thêm booking flow
- ✅ Hệ thống phân quyền
- ✅ Thông báo & modal UX mới
- ✅ Ghi chú responsive và lỗi

### v1.0.0 (Khởi tạo)

- ✅ Layout giới thiệu
- ✅ Layout CMS cơ bản
- ✅ Đăng nhập & routing

## 📞 Hỗ trợ

- **Tài liệu chi tiết**: [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md)
- **Phát hiện lỗi**: xem console, network, localStorage rồi mở issue

---

**Version**: 2.0.0  
**Last Updated**: 2025-01-25  
**License**: Private
