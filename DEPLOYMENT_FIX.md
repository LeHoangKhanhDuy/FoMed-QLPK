# Hướng dẫn khắc phục lỗi 404 API trên Vercel

## Vấn đề
Khi deploy lên Vercel, ứng dụng gặp lỗi 404 khi gọi API `/api/v1/doctors` vì:
- Local development: Vite proxy chuyển hướng `/api` đến backend server
- Production: Không có proxy, nên `/api` gọi đến chính domain Vercel (không có backend)

## Giải pháp đã áp dụng
1. ✅ Cập nhật `src/services/doctorMApi.ts` và `src/services/specialtyApi.ts` để sử dụng `VITE_API_BASE_URL`
2. ✅ Tạo file `.env.example` với hướng dẫn cấu hình

## Cách cấu hình cho Production

### Bước 1: Tạo Environment Variable trên Vercel
1. Vào Vercel Dashboard → Project của bạn
2. Vào tab **Settings** → **Environment Variables**
3. Thêm biến mới:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: URL của backend API (ví dụ: `https://your-backend-api.com`)
   - **Environment**: Production (và Preview nếu cần)

### Bước 2: Redeploy
Sau khi thêm environment variable, Vercel sẽ tự động redeploy. Hoặc bạn có thể:
1. Vào tab **Deployments**
2. Click **Redeploy** trên deployment mới nhất

### Bước 3: Kiểm tra
Sau khi deploy xong, kiểm tra:
1. Mở Developer Tools (F12)
2. Vào tab **Network**
3. Refresh trang và xem API calls
4. URL API phải trỏ đến backend thực tế, không phải domain Vercel

## Cấu hình Local Development
Tạo file `.env` trong root project:
```
VITE_API_BASE_URL=
```
Để trống để sử dụng Vite proxy (localhost:5006)

## Lưu ý
- Backend API phải có CORS được cấu hình để cho phép domain Vercel
- Backend API phải có endpoint `/api/v1/doctors` và `/api/v1/specialties`
- Nếu backend chạy trên port khác, cập nhật `vite.config.ts` proxy target
