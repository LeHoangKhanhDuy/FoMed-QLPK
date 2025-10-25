# 🏥 Quản lý Phòng Khám - Frontend

> React + TypeScript + Vite + TailwindCSS

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📚 Documentation

**Xem tài liệu đầy đủ tại:** [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md)

### Nội dung chính:
1. **Service Manager** - Quản lý dịch vụ y tế
2. **Service Image Upload** - Upload và quản lý ảnh dịch vụ
3. **User Role Management** - Quản lý vai trò người dùng
4. **Authentication & Session** - Xác thực và phiên đăng nhập
5. **Error Pages** - Trang lỗi chuyên nghiệp
6. **Testing Guide** - Hướng dẫn test

## 🎯 Features

### ✅ Đã hoàn thành
- ✅ Service Manager với VND price format (5.000.000)
- ✅ Image upload (URL + preview)
- ✅ User role management (single selection)
- ✅ Smart session handling (CMS không logout tự động)
- ✅ Professional error pages (404, 403, 500, Maintenance)
- ✅ Search & filter với debounce
- ✅ Pagination
- ✅ Responsive design

### ⏳ Đang phát triển
- ⏳ Backend upload endpoint cho images
- ⏳ Image compression
- ⏳ Drag & drop upload
- ⏳ Multiple images per service

## 🔧 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: Headless UI
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
src/
├── component/
│   ├── Admin/              # CMS components
│   │   ├── ServiceManager/
│   │   ├── User/
│   │   ├── DrugManager/
│   │   └── ...
│   ├── Booking/            # Booking flow
│   ├── Home/               # Public pages
│   └── ui/                 # Reusable UI components
├── services/               # API calls
├── types/                  # TypeScript types
├── auth/                   # Authentication
├── pages/                  # Route pages
└── Utils/                  # Utilities
```

## 🌐 Environment Variables

```env
# .env
VITE_API_BASE_URL=https://your-api-url.com
```

## 🔐 Roles & Permissions

| Role | Access |
|------|--------|
| `ADMIN` | Full CMS access |
| `DOCTOR` | CMS limited (patient list, workspace) |
| `EMPLOYEE` | CMS limited (appointments, read-only) |
| `PATIENT` | Public pages only |

## 📊 Key Features Detail

### 1. Service Manager (`/cms/service-manager`)
- CRUD operations
- VND price formatting (5.000.000)
- Image upload & preview
- Search & filter
- Pagination

### 2. User Management (`/cms/users-manager`)
- View users
- Edit roles (single selection)
- Activate/Deactivate accounts
- Search & filter

### 3. Authentication
- JWT token-based
- Smart 401 handling
- CMS session persistence
- Auto logout for public users

### 4. Error Handling
- Professional error pages
- Graceful degradation
- User-friendly messages

## 🧪 Testing

Xem chi tiết tại: [`PROJECT_DOCUMENTATION.md#6-testing-guide`](./PROJECT_DOCUMENTATION.md#6-testing-guide)

### Quick Test
```bash
1. Start dev server: npm run dev
2. Login as ADMIN
3. Navigate to /cms/service-manager
4. Create new service with image
5. Verify VND format: 5.000.000
6. Verify image displays
```

## 🐛 Known Issues

1. **File Upload**: Chỉ local preview, cần backend endpoint
2. **Image Validation**: Chưa validate format/size
3. **Bulk Actions**: Chưa có bulk delete/toggle

## 🚀 Deployment

### Vercel
```bash
1. Set environment variable: VITE_API_BASE_URL
2. Deploy: vercel --prod
3. Verify CORS on backend
```

### Other Platforms
```bash
1. Build: npm run build
2. Upload dist/ folder
3. Set VITE_API_BASE_URL
4. Configure CORS
```

## 📝 Changelog

### v2.0.0 (2025-01-25)
- ✅ VND price formatting
- ✅ Image upload UI
- ✅ User role management
- ✅ Smart session handling
- ✅ Error pages
- ✅ Consolidated documentation

### v1.0.0 (Initial)
- ✅ Basic CRUD
- ✅ Authentication
- ✅ CMS layout
- ✅ Public pages

## 📞 Support

**Documentation**: [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md)

**Issues?** Check:
1. Console logs
2. Network tab
3. localStorage
4. Documentation

---

**Version**: 2.0.0  
**Last Updated**: 2025-01-25  
**License**: Private
