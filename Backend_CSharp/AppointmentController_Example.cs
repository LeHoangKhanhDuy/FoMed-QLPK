using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

/// <summary>
/// VÍ DỤ: Cách sử dụng AppointmentStatusUpdateHandler trong AppointmentController
/// Khi update appointment status, gọi handler để tự động cập nhật encounter
/// </summary>
[ApiController]
[Route("api/v1/admin/appointments")]
[Authorize(Roles = "ADMIN,DOCTOR")]
public class AppointmentController : ControllerBase
{
    private readonly FoMedContext _db;
    private readonly AppointmentStatusUpdateHandler _statusHandler;

    public AppointmentController(FoMedContext db, AppointmentStatusUpdateHandler statusHandler)
    {
        _db = db;
        _statusHandler = statusHandler;
    }

    /// <summary>
    /// VÍ DỤ: Update appointment status và tự động cập nhật encounter
    /// </summary>
    [HttpPatch("{appointmentId}/status")]
    [SwaggerOperation(Summary = "Cập nhật trạng thái lịch hẹn")]
    public async Task<IActionResult> UpdateAppointmentStatus(
        [FromRoute] long appointmentId,
        [FromBody] UpdateStatusRequest request,
        CancellationToken ct = default)
    {
        var appointment = await _db.Appointments
            .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId, ct);

        if (appointment == null)
            return NotFound(new { success = false, message = "Không tìm thấy lịch hẹn." });

        var oldStatus = appointment.Status;
        appointment.Status = request.Status;
        await _db.SaveChangesAsync(ct);

        // QUAN TRỌNG: Gọi handler để tự động cập nhật encounter status
        await _statusHandler.UpdateEncounterStatusAsync(appointmentId, request.Status, ct);

        return Ok(new
        {
            success = true,
            message = "Cập nhật trạng thái thành công.",
            data = new
            {
                appointmentId = appointment.AppointmentId,
                oldStatus,
                newStatus = appointment.Status
            }
        });
    }
}

public class UpdateStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

