using Microsoft.EntityFrameworkCore;
using FoMed.Api.Models;

/// <summary>
/// Service để tự động cập nhật Encounter status khi Appointment status thay đổi
/// Nên gọi service này trong AppointmentController khi update appointment status
/// </summary>
public class AppointmentStatusUpdateHandler
{
    private readonly FoMedContext _db;

    public AppointmentStatusUpdateHandler(FoMedContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Tự động cập nhật Encounter status khi Appointment được đánh dấu là "done"
    /// </summary>
    /// <param name="appointmentId">ID của appointment vừa được cập nhật</param>
    /// <param name="newStatus">Status mới của appointment</param>
    public async Task UpdateEncounterStatusAsync(long appointmentId, string newStatus, CancellationToken ct = default)
    {
        // Chỉ xử lý khi appointment được đánh dấu là "done"
        if (newStatus?.ToLower() != "done")
            return;

        var appointment = await _db.Appointments
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId, ct);

        if (appointment == null)
            return;

        // Tìm encounter tương ứng
        // Match theo: PatientId, DoctorId, và ngày khám (trong vòng 1 ngày)
        var encounter = await _db.Encounters
            .Where(e => e.PatientId == appointment.PatientId
                && e.DoctorId == appointment.DoctorId
                && (e.CreatedAt.Date == appointment.VisitDate.Date ||
                    Math.Abs((e.CreatedAt.Date - appointment.VisitDate.Date).Days) <= 1)
                && (e.Status == null || e.Status.ToLower() == "draft"))
            .OrderByDescending(e => e.CreatedAt)
            .FirstOrDefaultAsync(ct);

        if (encounter != null)
        {
            // Cập nhật encounter status thành "finalized"
            encounter.Status = "finalized";
            _db.Encounters.Update(encounter);
            await _db.SaveChangesAsync(ct);
        }
    }

    /// <summary>
    /// Batch update: Cập nhật tất cả encounters có appointment tương ứng đã "done"
    /// Có thể gọi method này trong một background job hoặc khi khởi động ứng dụng
    /// </summary>
    public async Task SyncAllEncounterStatusesAsync(CancellationToken ct = default)
    {
        // Lấy tất cả appointments có status "done" mà chưa có encounter tương ứng được finalized
        var doneAppointments = await _db.Appointments
            .AsNoTracking()
            .Where(a => a.Status == "done")
            .ToListAsync(ct);

        foreach (var appointment in doneAppointments)
        {
            var encounter = await _db.Encounters
                .Where(e => e.PatientId == appointment.PatientId
                    && e.DoctorId == appointment.DoctorId
                    && (e.CreatedAt.Date == appointment.VisitDate.Date ||
                        Math.Abs((e.CreatedAt.Date - appointment.VisitDate.Date).Days) <= 1)
                    && (e.Status == null || e.Status.ToLower() == "draft"))
                .OrderByDescending(e => e.CreatedAt)
                .FirstOrDefaultAsync(ct);

            if (encounter != null)
            {
                encounter.Status = "finalized";
                _db.Encounters.Update(encounter);
            }
        }

        await _db.SaveChangesAsync(ct);
    }
}

