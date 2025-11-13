# Hướng dẫn sửa Backend để đồng bộ Encounter Status với Appointment Status

## Vấn đề
Khi Appointment có status `done` (đã khám xong), Encounter tương ứng vẫn có status `draft` thay vì `finalized`, dẫn đến hiển thị sai ở frontend.

## Giải pháp

Có 2 cách để sửa:

### Cách 1: Sửa API GetHistory (Đơn giản, nhanh) ✅ KHUYẾN NGHỊ

**File:** `EncounterController.cs`

Sử dụng code trong file `EncounterController_Fixed.cs`:
- Join với Appointment table khi query
- Nếu encounter là `draft` và có appointment tương ứng với status `done`, thì trả về status `finalized`
- Không cần thay đổi database, chỉ sửa logic query

**Ưu điểm:**
- Không cần thay đổi database
- Không cần migration
- Áp dụng ngay được

**Nhược điểm:**
- Status trong database vẫn là `draft`, chỉ hiển thị khác ở API response

### Cách 2: Tự động cập nhật Encounter khi Appointment status thay đổi (Tốt hơn, lâu dài)

**Files:**
1. `AppointmentStatusUpdateHandler.cs` - Service để xử lý logic
2. `AppointmentController_Example.cs` - Ví dụ cách sử dụng

**Các bước:**

1. **Thêm service vào DI Container** (thường ở `Program.cs` hoặc `Startup.cs`):
```csharp
builder.Services.AddScoped<AppointmentStatusUpdateHandler>();
```

2. **Sửa AppointmentController** để gọi handler khi update status:
```csharp
[HttpPatch("{appointmentId}/status")]
public async Task<IActionResult> UpdateAppointmentStatus(
    [FromRoute] long appointmentId,
    [FromBody] UpdateStatusRequest request,
    CancellationToken ct = default)
{
    // ... update appointment status ...
    
    // QUAN TRỌNG: Gọi handler để tự động cập nhật encounter
    await _statusHandler.UpdateEncounterStatusAsync(appointmentId, request.Status, ct);
    
    // ... return response ...
}
```

3. **Chạy batch sync** (tùy chọn) để cập nhật các encounter cũ:
```csharp
// Có thể gọi trong một background job hoặc endpoint admin
await _statusHandler.SyncAllEncounterStatusesAsync(ct);
```

**Ưu điểm:**
- Status trong database được cập nhật đúng
- Tự động đồng bộ khi appointment status thay đổi
- Giải pháp lâu dài, đúng chuẩn

**Nhược điểm:**
- Cần thêm service và dependency injection
- Cần sửa AppointmentController

## Khuyến nghị

**Nếu cần fix nhanh:** Dùng **Cách 1** (sửa EncounterController.GetHistory)

**Nếu muốn giải pháp tốt lâu dài:** Dùng **Cách 2** (tự động cập nhật khi appointment status thay đổi)

**Hoặc kết hợp cả 2:** Dùng Cách 1 để fix ngay, sau đó implement Cách 2 để fix lâu dài.

## Lưu ý

- Đảm bảo có relationship giữa Appointment và Encounter (qua PatientId, DoctorId, và VisitDate)
- Nếu có AppointmentId trong Encounter table, có thể match chính xác hơn
- Kiểm tra logic matching (theo ngày) có phù hợp với business logic của bạn không

