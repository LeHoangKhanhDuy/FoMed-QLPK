# 📚 Project Documentation - Quản lý Phòng Khám

> **Tài liệu tổng hợp** cho dự án Quản lý Phòng Khám  
> **Version**: 2.0.0  
> **Last Updated**: 2025-01-25

---

## 📑 Mục lục

1. [Service Manager](#1-service-manager)
2. [Service Image Upload](#2-service-image-upload)
3. [User Role Management](#3-user-role-management)
4. [Authentication & Session](#4-authentication--session)
5. [Error Pages](#5-error-pages)
6. [Testing Guide](#6-testing-guide)

---

# 1. Service Manager

## 📋 Tổng quan

Module **Quản lý dịch vụ** (`/cms/service-manager`) cho phép ADMIN quản lý toàn bộ dịch vụ y tế của phòng khám.

## ✅ Tính năng

### CRUD Operations
- ✅ **Create**: Thêm dịch vụ mới
- ✅ **Read**: Xem danh sách dịch vụ (có phân trang)
- ✅ **Update**: Sửa thông tin dịch vụ
- ✅ **Delete**: Xóa dịch vụ

### Service Fields
```typescript
{
  serviceId: number;           // ID dịch vụ (auto)
  code: string | null;         // Mã dịch vụ (required)
  name: string;                // Tên dịch vụ (required)
  description: string | null;  // Mô tả chi tiết (required)
  basePrice: number | null;    // Đơn giá VNĐ (required, format: 5.000.000)
  durationMin: number | null;  // Thời lượng phút (required)
  categoryId: number;          // Loại dịch vụ (required)
  isActive: boolean;           // Trạng thái hoạt động
  imageUrl: string | null;     // URL ảnh dịch vụ (required)
  createdAt: string;           // Ngày tạo
  updatedAt: string;           // Ngày cập nhật
}
```

### Additional Features
- ✅ Search & Filter (debounce 300ms)
- ✅ Pagination (10 items/page)
- ✅ Status Management (Active/Inactive)
- ✅ Image Management (URL + Upload)
- ✅ Category Integration
- ✅ VND Price Formatting (5.000.000)

## 🎨 UI Components

### ServiceManager.tsx (Main Page)
```
┌─────────────────────────────────────────────────┐
│ 🗂️ Quản lý danh mục dịch vụ (50 dịch vụ)       │
│ ┌─────────────────┐  ┌──────────────┐          │
│ │ 🔍 Tìm kiếm...  │  │ + Thêm dịch vụ│          │
│ └─────────────────┘  └──────────────┘          │
├─────────────────────────────────────────────────┤
│ Mã │ Tên │ Mô tả │ Ảnh │ Giá │ Thời gian │...  │
├─────────────────────────────────────────────────┤
│ KTQ│ Khám│ ...   │[📷] │500K │ 60 phút   │ ⚙️  │
│ XN │ Xét │ ...   │[📷] │200K │ 30 phút   │ ⚙️  │
└─────────────────────────────────────────────────┘
```

### ServiceModal.tsx (Create/Edit)
```
┌─────────────────────────────────────────────────┐
│              THÊM DỊCH VỤ                   [X] │
├─────────────────────────────────────────────────┤
│ Mã dịch vụ *           │ Tên dịch vụ *          │
│ [____________]         │ [____________]         │
│                                                  │
│ Mô tả *                                         │
│ [_____________________________________]         │
│                                                  │
│ Đơn giá (VNĐ) *        │ Thời lượng (phút) *    │
│ [5.000.000]            │ [60]                   │
│                                                  │
│ Loại dịch vụ *                                  │
│ [▼ Chọn loại dịch vụ]                          │
│                                                  │
│ Ảnh dịch vụ *                                   │
│ [🖼️ Nhập URL...]  [📤 Upload]                  │
│ ┌──────────┐                                    │
│ │   [❌]   │                                    │
│ │  Image   │                                    │
│ └──────────┘                                    │
│                                                  │
│              [Huỷ]  [💾 Lưu]                    │
└─────────────────────────────────────────────────┘
```

## 🔌 API Endpoints

### Public
```typescript
GET /api/v1/services?page=1&pageSize=10&keyword=khám&isActive=true
```

### Admin
```typescript
// Create
POST /api/v1/services/add
{
  "code": "KTQ",
  "name": "Khám tổng quát",
  "description": "...",
  "basePrice": 500000,
  "durationMin": 60,
  "categoryId": 1,
  "isActive": true,
  "imageUrl": "https://..."
}

// Update
PUT /api/v1/services/update/{id}
{...}

// Toggle Status
PATCH /api/v1/services/status/{id}
{ "isActive": true }

// Delete
DELETE /api/v1/services/remove/{id}
```

## 🎯 Use Cases

### UC1: Thêm dịch vụ mới
```
1. Vào /cms/service-manager
2. Click "+ Thêm dịch vụ"
3. Điền form:
   - Mã: XN001
   - Tên: Xét nghiệm máu tổng quát
   - Mô tả: Xét nghiệm công thức máu...
   - Đơn giá: 200000 (hiển thị: 200.000)
   - Thời lượng: 30
   - Loại: Xét nghiệm
   - Ảnh: https://...
4. Click "Lưu"
5. ✅ Toast success + Table refresh
```

### UC2: Format giá VND
```
User nhập: 5000000
→ Hiển thị: 5.000.000
→ Lưu: 5000000 (number)

User nhập: 50000
→ Hiển thị: 50.000
→ Số 0 không bị mất ✅
```

## 📂 Files

```
src/
├── component/Admin/ServiceManager/
│   ├── ServiceManager.tsx      # Main page
│   └── ServiceModal.tsx        # Create/Edit modal
├── services/
│   ├── service.ts              # API calls
│   └── serviceCate.ts          # Category API
└── types/serviceType/
    └── service.ts              # Type definitions
```

---

# 2. Service Image Upload

## 🎯 Tính năng

Upload và quản lý ảnh cho dịch vụ trong `/cms/service-manager`.

## ✅ Đã hoàn thành

### Backend Integration
- ✅ `imageUrl` field trong database
- ✅ API Create/Update/Get hỗ trợ `imageUrl`

### Frontend Features
- ✅ Input URL ảnh (manual)
- ✅ Upload button (file picker)
- ✅ Image preview (128x128px)
- ✅ Remove image button
- ✅ Table display (64x64px thumbnail)
- ✅ Fallback placeholder
- ✅ Error handling
- ⚠️ File upload (local preview only - cần backend endpoint)

## 🎨 UI Implementation

### Modal - Upload Section
```typescript
<div className="col-span-2">
  <label className="text-sm">
    <div className="flex items-center gap-1">
      <span className="block mb-1 text-slate-600">Ảnh dịch vụ</span>
      <span className="text-red-500">*</span>
    </div>
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Input URL */}
      <div className="flex-1">
        <div className="relative">
          <input
            type="url"
            value={form.imageUrl ?? ""}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="Nhập URL ảnh hoặc upload file"
          />
          <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Upload button */}
      <label className="cursor-pointer ...">
        <Upload className="w-5 h-5" />
        <span>Upload</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const url = URL.createObjectURL(file);
              setForm({ ...form, imageUrl: url });
              setErr("⚠️ Chức năng upload đang phát triển. Vui lòng nhập URL ảnh.");
            }
          }}
        />
      </label>
    </div>
  </label>

  {/* Preview */}
  {form.imageUrl && (
    <div className="mt-3 relative inline-block">
      <img
        src={form.imageUrl}
        alt="Preview"
        className="w-32 h-32 object-cover rounded-lg border-2"
        onError={() => setErr("❌ URL ảnh không hợp lệ")}
      />
      <button
        onClick={() => setForm({ ...form, imageUrl: null })}
        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )}
</div>
```

### Table - Image Display
```typescript
<td className="px-3 py-2">
  <div className="flex justify-center">
    {s.imageUrl ? (
      <img
        src={s.imageUrl}
        alt={s.name}
        className="w-16 h-16 object-cover rounded-lg border-2 shadow-sm"
        onError={(e) => {
          e.currentTarget.src = "https://via.placeholder.com/64?text=No+Image";
        }}
      />
    ) : (
      <div className="w-16 h-16 flex items-center justify-center bg-slate-100 rounded-lg border-2 border-dashed">
        <span className="text-xs text-slate-400">Chưa có</span>
      </div>
    )}
  </div>
</td>
```

## 📝 Example URLs

```
# Medical/Hospital
https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400
https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400

# Lab/Testing
https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400
https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400

# Ultrasound
https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400
```

## ⚠️ Lưu ý

### File Upload
- ⚠️ Upload button chỉ tạo **local preview** (không lưu server)
- ⚠️ Cần backend endpoint: `POST /api/v1/admin/upload/service-image`
- ✅ Hiện tại dùng **URL input** là tốt nhất

### Image Requirements
- Format: JPG, PNG, WebP
- Size: Max 2MB (recommend)
- Dimensions: 512x512px (square) hoặc 16:9

## 🚀 Future Enhancements

1. ⏳ Backend upload endpoint
2. ⏳ Image compression
3. ⏳ Drag & drop
4. ⏳ Image gallery (multiple images)
5. ⏳ CDN integration

---

# 3. User Role Management

## 🎯 Tính năng

Chỉnh sửa vai trò người dùng trong `/cms/users-manager`.

## ✅ Đã hoàn thành

### Features
- ✅ Edit user roles (single selection)
- ✅ Modal UI với radio buttons
- ✅ Role badges với màu sắc
- ✅ Validation (phải chọn 1 role)
- ✅ API integration
- ✅ Real-time table update

### Available Roles
```typescript
type AdminRole = "ADMIN" | "DOCTOR" | "EMPLOYEE" | "PATIENT";

const roleLabel: Record<AdminRole, string> = {
  ADMIN: "Quản trị viên",
  DOCTOR: "Bác sĩ",
  EMPLOYEE: "Nhân viên",
  PATIENT: "Bệnh nhân",
};

const roleBadge = (r: AdminRole) => {
  switch (r) {
    case "ADMIN": return "bg-sky-100 text-sky-700";
    case "DOCTOR": return "bg-violet-100 text-violet-700";
    case "EMPLOYEE": return "bg-amber-100 text-amber-700";
    case "PATIENT": return "bg-slate-100 text-slate-700";
  }
};
```

## 🎨 UI Components

### UserManager.tsx
```typescript
<button
  onClick={() => openEditRoleModal(user)}
  className="inline-flex items-center gap-1 px-2 py-2 bg-primary-linear text-white rounded-[var(--rounded)]"
  title="Sửa vai trò"
>
  <Pencil className="w-5 h-5" />
</button>
```

### EditRoleModal.tsx
```
┌─────────────────────────────────────────────────┐
│ CHỈNH SỬA VAI TRÒ                          [X] │
├─────────────────────────────────────────────────┤
│ Người dùng                                      │
│ Nguyễn Văn A                                    │
│ nguyenvana@email.com                            │
│ 0123456789                                      │
│                                                  │
│ Chọn vai trò *                                  │
│ ○ Quản trị viên                                 │
│ ● Bác sĩ                    ← Selected          │
│ ○ Nhân viên                                     │
│ ○ Bệnh nhân                                     │
│                                                  │
│ * Chỉ được chọn một vai trò                     │
│                                                  │
│              [Hủy]  [💾 Lưu]                    │
└─────────────────────────────────────────────────┘
```

## 🔌 API

```typescript
// Update user roles
PUT /api/v1/admin/user-update/{id}
{
  "roles": ["DOCTOR"]  // Array với 1 phần tử
}

Response:
{
  "success": true,
  "message": "User updated successfully"
}
```

## 🎯 Use Cases

### UC1: Sửa vai trò user
```
1. Vào /cms/users-manager
2. Click nút "Sửa vai trò" (✏️)
3. Modal mở với role hiện tại
4. Chọn role mới (radio button)
5. Click "Lưu"
6. ✅ Toast success
7. ✅ Table update với role mới
```

## 📂 Files

```
src/
├── component/Admin/User/
│   ├── UserManager.tsx         # Main page
│   └── EditRoleModal.tsx       # Edit role modal
└── services/
    └── userApi.ts              # API: updateUserRoles()
```

---

# 4. Authentication & Session

## 🎯 Tính năng

Quản lý phiên đăng nhập và xử lý token expiration.

## ✅ Đã hoàn thành

### Features
- ✅ JWT token authentication
- ✅ Auto token injection (request interceptor)
- ✅ Smart 401 handling (response interceptor)
- ✅ CMS session persistence (không logout tự động)
- ✅ Public user auto logout
- ✅ AuthProvider với loading state
- ✅ Session restoration từ localStorage

## 🔧 Implementation

### HTTP Interceptors
```typescript
// src/services/http.ts

// Request interceptor: Thêm token
authHttp.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: Xử lý 401
authHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
      const cmsRoles = ["ADMIN", "DOCTOR", "EMPLOYEE"];
      const hasCmsRole = authUser.roles?.some(r => cmsRoles.includes(r));
      
      if (hasCmsRole && window.location.pathname.startsWith("/cms")) {
        // CMS user: Chỉ warning, không logout
        toast.error("Phiên làm việc sắp hết hạn. Vui lòng lưu công việc của bạn.", {
          duration: 5000,
        });
      } else {
        // Public user: Logout và redirect
        localStorage.removeItem("userToken");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("userInfo");
        toast.error("Phiên đăng nhập đã hết hạn!");
        setTimeout(() => {
          window.location.href = "/401";
        }, 1000);
      }
    }
    return Promise.reject(error);
  }
);
```

### AuthProvider
```typescript
// src/auth/auth.tsx

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Restore từ auth_user
    const authRaw = localStorage.getItem("auth_user");
    if (authRaw) {
      const parsed = JSON.parse(authRaw);
      if (isUser(parsed)) {
        setUser(parsed);
        setIsInitialized(true);
        return;
      }
    }

    // Fallback: Rebuild từ userInfo + userToken
    const userToken = localStorage.getItem("userToken");
    const userInfoRaw = localStorage.getItem("userInfo");
    if (userToken && userInfoRaw) {
      const userInfo = JSON.parse(userInfoRaw);
      const rebuiltUser: User = {
        id: userInfo.userId || 0,
        email: userInfo.email || "",
        roles: (userInfo.roles || []).map(r => r.toUpperCase()),
        token: userToken,
        name: userInfo.name || null,
      };
      setUser(rebuiltUser);
      localStorage.setItem("auth_user", JSON.stringify(rebuiltUser));
    }
    
    setIsInitialized(true);
  }, []);

  // Show loading spinner while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

## 🎯 Behavior

### CMS Users (ADMIN, DOCTOR, EMPLOYEE)
```
Token expires (401)
→ Check: hasCmsRole && on /cms path
→ Action: Show warning toast
→ Result: User stays logged in
→ Purpose: Prevent data loss during work
```

### Public Users (PATIENT, unauthenticated)
```
Token expires (401)
→ Check: Not CMS role OR not on /cms path
→ Action: Clear localStorage + redirect /401
→ Result: User logged out
→ Purpose: Security
```

## 📂 Files

```
src/
├── services/
│   └── http.ts                 # Axios interceptors
├── auth/
│   ├── auth.tsx                # AuthProvider
│   └── RequireCMSRole.tsx      # Route guard
└── pages/Error/
    └── UnauthorizedPage.tsx    # 401 page (deleted)
```

---

# 5. Error Pages

## 🎯 Tính năng

Professional error pages cho các HTTP status codes.

## ✅ Đã hoàn thành

### Error Pages
- ✅ **404 Not Found** - Trang không tồn tại
- ✅ **403 Forbidden** - Không có quyền truy cập
- ✅ **500 Server Error** - Lỗi máy chủ
- ✅ **Maintenance** - Bảo trì hệ thống
- ❌ **401 Unauthorized** - Đã xóa (dùng interceptor thay thế)

## 🎨 UI Design

### Common Features
- ✅ Large error code (180-220px)
- ✅ Icon illustration
- ✅ Clear error message
- ✅ Action buttons (Back, Home)
- ✅ Gradient background
- ✅ Responsive design
- ✅ Professional styling

### 404 Not Found
```
┌─────────────────────────────────────────────────┐
│                                                  │
│                    404                           │
│                   [🔍]                           │
│                                                  │
│            Không tìm thấy trang                  │
│   Xin lỗi, trang bạn đang tìm kiếm không tồn tại│
│                                                  │
│         [← Quay lại]  [🏠 Về trang chủ]         │
└─────────────────────────────────────────────────┘
```

### 403 Forbidden
```
┌─────────────────────────────────────────────────┐
│                    403                           │
│                   [🛡️]                           │
│                                                  │
│           Truy cập bị từ chối                    │
│   Bạn không có quyền truy cập vào trang này     │
│                                                  │
│         ┌─────────────────────────┐             │
│         │ 🔒 Yêu cầu phân quyền   │             │
│         │ Trang này chỉ dành cho  │             │
│         │ người dùng có quyền...  │             │
│         └─────────────────────────┘             │
│                                                  │
│         [← Quay lại]  [🏠 Về trang chủ]         │
└─────────────────────────────────────────────────┘
```

### 500 Server Error
```
┌─────────────────────────────────────────────────┐
│                    500                           │
│                   [💥]                           │
│                                                  │
│              Lỗi máy chủ                         │
│   Xin lỗi, có lỗi xảy ra ở phía máy chủ         │
│                                                  │
│         ┌─────────────────────────┐             │
│         │ Đừng lo lắng            │             │
│         │ • Lỗi này không phải do │             │
│         │   bạn                   │             │
│         │ • Đội ngũ kỹ thuật đã   │             │
│         │   nhận được thông báo   │             │
│         └─────────────────────────┘             │
│                                                  │
│  [← Quay lại] [🔄 Thử lại] [🏠 Về trang chủ]   │
└─────────────────────────────────────────────────┘
```

## 🔌 Routes

```typescript
// src/App.tsx

<Routes>
  {/* ... other routes ... */}
  
  {/* Error Pages */}
  <Route path="/403" element={<ForbiddenPage />} />
  <Route path="/500" element={<ServerErrorPage />} />
  <Route path="/maintenance" element={<MaintenancePage />} />
  <Route path="*" element={<NotFoundPage />} />  {/* Catch-all */}
</Routes>
```

## 📂 Files

```
src/pages/Error/
├── NotFoundPage.tsx            # 404
├── ForbiddenPage.tsx           # 403
├── ServerErrorPage.tsx         # 500
├── MaintenancePage.tsx         # Maintenance
└── index.ts                    # Exports
```

---

# 6. Testing Guide

## 🧪 Service Manager Tests

### Test 1: Create Service
```
1. Vào /cms/service-manager
2. Click "+ Thêm dịch vụ"
3. Điền form:
   - Mã: TEST001 *
   - Tên: Test Service *
   - Mô tả: Test description *
   - Đơn giá: 500000 (hiển thị: 500.000) *
   - Thời lượng: 30 *
   - Loại: Chọn category *
   - Ảnh: https://images.unsplash.com/... *
4. Click "Lưu"

Expected:
✅ Toast success
✅ Service appears in table
✅ Image displays correctly
✅ Price formatted: 500.000
```

### Test 2: VND Price Format
```
Input: 5000000
→ Display: 5.000.000
→ Saved: 5000000

Input: 50000
→ Display: 50.000
→ Saved: 50000
→ ✅ Số 0 không bị mất

Input: "5.000.000" (paste)
→ Strip dots → "5000000"
→ Display: 5.000.000
→ Saved: 5000000
```

### Test 3: Image Upload
```
Option A: URL Input
1. Nhập URL: https://images.unsplash.com/...
2. Preview hiển thị
3. Click "Lưu"
→ ✅ Image saved

Option B: File Upload
1. Click "Upload"
2. Chọn file
3. Preview hiển thị (local)
4. ⚠️ Warning: "Chức năng upload đang phát triển"
5. Click "Lưu"
→ ⚠️ Image NOT saved (expected)
```

### Test 4: Edit Service
```
1. Click "Sửa" (✏️)
2. Modal mở với data hiện tại
3. Sửa giá: 1000000 → Display: 1.000.000
4. Thay đổi ảnh
5. Click "Lưu"
→ ✅ Updates reflected
```

### Test 5: Remove Image
```
1. Open edit modal
2. Click "❌" on image preview
3. Preview disappears
4. Click "Lưu"
→ ✅ imageUrl = null
→ ✅ Table shows "Chưa có"
```

## 🧪 User Role Tests

### Test 6: Edit User Role
```
1. Vào /cms/users-manager
2. Click "Sửa vai trò" (✏️)
3. Modal mở với current role
4. Select new role (radio button)
5. Click "Lưu"

Expected:
✅ Toast success
✅ Table updates with new role badge
✅ Color changes based on role
```

### Test 7: Role Validation
```
1. Open edit modal
2. Don't select any role
3. Click "Lưu"
→ ✅ Error: "Vui lòng chọn một vai trò!"

1. Select role
2. Click "Lưu"
→ ✅ Success
```

## 🧪 Authentication Tests

### Test 8: CMS Session (401)
```
1. Login as ADMIN/DOCTOR/EMPLOYEE
2. Navigate to /cms/*
3. Token expires (simulate 401)

Expected:
⚠️ Warning toast appears
✅ User stays logged in
✅ No redirect
✅ Can continue working
```

### Test 9: Public Session (401)
```
1. Login as PATIENT
2. Navigate to /user/*
3. Token expires (simulate 401)

Expected:
❌ Error toast appears
❌ User logged out
❌ Redirect to /401
✅ localStorage cleared
```

## 🧪 Error Page Tests

### Test 10: 404 Not Found
```
1. Navigate to /nonexistent-page

Expected:
✅ 404 page displays
✅ "Không tìm thấy trang" message
✅ Back button works
✅ Home button works
```

### Test 11: 403 Forbidden
```
1. Login as PATIENT
2. Try to access /cms/*

Expected:
✅ Redirect to /403
✅ "Truy cập bị từ chối" message
✅ Permission notice displays
```

## 📊 Test Results Template

| Test | Status | Notes |
|------|--------|-------|
| Create Service | ⬜ | |
| VND Format | ⬜ | |
| Image Upload | ⬜ | |
| Edit Service | ⬜ | |
| Remove Image | ⬜ | |
| Edit Role | ⬜ | |
| Role Validation | ⬜ | |
| CMS Session | ⬜ | |
| Public Session | ⬜ | |
| 404 Page | ⬜ | |
| 403 Page | ⬜ | |

---

## 📝 Quick Reference

### Important URLs
```
/cms/service-manager          # Quản lý dịch vụ
/cms/users-manager            # Quản lý users
/cms/drug-manager             # Quản lý thuốc
/cms/patient-list-today       # Danh sách bệnh nhân
/cms/dashboard                # Dashboard
```

### localStorage Keys
```
userToken                     # JWT token
userInfo                      # User info (old format)
auth_user                     # User info (new format)
redirectAfterLogin            # Redirect URL
```

### Role Hierarchy
```
ADMIN       → Full access
DOCTOR      → CMS access (limited)
EMPLOYEE    → CMS access (limited)
PATIENT     → Public access only
```

### API Base URL
```
Development:  http://localhost:5006
Production:   https://ugf6yk2j1a.execute-api.ap-southeast-1.amazonaws.com
```

---

## 🚀 Deployment Checklist

- [ ] Set `VITE_API_BASE_URL` environment variable
- [ ] Configure CORS on backend
- [ ] Test all API endpoints
- [ ] Verify image URLs work (CDN/S3)
- [ ] Test authentication flow
- [ ] Test error pages
- [ ] Test responsive design
- [ ] Clear browser cache
- [ ] Test on multiple browsers

---

## 📞 Support & Contact

**Developer**: AI Assistant  
**Version**: 2.0.0  
**Last Updated**: 2025-01-25

**Issues?** Check:
1. Console logs
2. Network tab (API calls)
3. localStorage data
4. This documentation

---

**End of Documentation** 📚

