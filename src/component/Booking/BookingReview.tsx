import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Home,
  Clock,
  User,
  Package,
  CheckIcon,
  CalendarDays,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { getService } from "../../services/service";
import { apiGetDoctorDetail, type DoctorItem } from "../../services/doctorMApi";
import { createAppointment } from "../../services/appointmentsApi";

export const BookingReview = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const serviceId = searchParams.get("serviceId");
  const doctorId = searchParams.get("doctorId");
  const visitDate = searchParams.get("visitDate");
  const visitTime = searchParams.get("visitTime");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingInfo, setBookingInfo] = useState<{
    service: {
      id: number;
      name: string;
      price: number;
      discountPrice?: number;
      specialty: string;
    };
    doctor: {
      id: number;
      name: string;
      experience: string;
      room: string;
    };
    date: string;
    time: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!serviceId || !doctorId || !visitDate || !visitTime) {
        toast.error("Thiếu thông tin đặt lịch");
        navigate(-1);
        return;
      }

      try {
        setLoading(true);

        // 1. Lấy dịch vụ
        const serviceRes = await getService({
          page: 1,
          pageSize: 100,
          isActive: true,
        });

        const service = serviceRes.data.items.find(
          (s) => s.serviceId === Number(serviceId)
        );

        if (!service) {
          toast.error("Không tìm thấy dịch vụ");
          navigate(-1);
          return;
        }

        // 2. Lấy bác sĩ
        const doctor: DoctorItem = await apiGetDoctorDetail(
          Number(doctorId)
        );

        setBookingInfo({
          service: {
            id: service.serviceId,
            name: service.name,
            price: service.basePrice ?? 0,
            specialty: service.category?.name || "Chuyên khoa tổng hợp",
          },
          doctor: {
            id: doctor.doctorId,
            name: doctor.fullName || "Bác sĩ",
            experience: doctor.experienceYears
              ? `${doctor.experienceYears} năm kinh nghiệm`
              : "Kinh nghiệm chuyên môn",
            room: doctor.roomName || "Chưa xác định",
          },
          date: visitDate,
          time: visitTime.substring(0, 5),
        });
      } catch (error) {
        console.error("Error:", error);
        toast.error("Không thể tải thông tin đặt lịch");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId, doctorId, visitDate, visitTime, navigate]);

  const handleConfirmBooking = async () => {
    if (!bookingInfo) return;

    try {
      setSubmitting(true);

      // TODO: Lấy patientId từ user đang đăng nhập (localStorage/context)
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const patientId = currentUser.patientId || currentUser.userId || 1;

      // Gọi API tạo appointment
      const appointmentData = {
        patientId: patientId,
        doctorId: bookingInfo.doctor.id,
        serviceId: bookingInfo.service.id,
        visitDate: bookingInfo.date,
        visitTime: bookingInfo.time + ":00", // Convert HH:mm to HH:mm:ss
        reason: `Đặt khám ${bookingInfo.service.name}`,
      };

      await createAppointment(appointmentData);

      // Hiển thị thông báo thành công
      toast.success("Đặt lịch thành công! Vui lòng kiểm tra lịch hẹn của bạn.");

      // Chuyển về trang lịch sử đặt lịch
      setTimeout(() => {
        navigate("/user/appointments");
      }, 1500);
    } catch (error) {
      // Proper error type handling
      if (error instanceof Error) {
        console.error("Booking error:", error);
        toast.error(error.message || "Đặt lịch thất bại. Vui lòng thử lại!");
      } else {
        console.error("Unknown error:", error);
        toast.error("Đặt lịch thất bại. Vui lòng thử lại!");
      }
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " đ";
  };

  if (loading) {
    return (
      <div>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
        </div>
      </div>
    );
  }

  if (!bookingInfo) {
    return (
      <div>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
          <p className="text-gray-600">Không tìm thấy thông tin đặt lịch</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 xl:px-0 py-4 sm:py-6 min-h-[70vh] lg:min-h-[60vh]">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-6 font-bold">
        <Link to="/" className="hover:underline">
          <Home size={18} />
        </Link>
        <span>›</span>
        <Link to="/booking-packages" className="hover:underline">
          Đặt gói khám
        </Link>
        <span>›</span>
        <Link
          to={`/booking-doctor?serviceId=${serviceId}`}
          className="hover:underline"
        >
          Chọn bác sĩ
        </Link>
        <span>›</span>
        <Link
          to={`/booking-doctor/booking-date?serviceId=${serviceId}&doctorId=${doctorId}`}
          className="hover:underline"
        >
          Chọn ngày
        </Link>
        <span>›</span>
        <span className="text-sky-400">Xác nhận đặt lịch</span>
      </nav>

      {/* Header */}
      <div className="flex justify-center items-center mb-6 p-6">
        <div className="flex flex-col items-center gap-3 mb-2">
          <CheckIcon className="w-10 h-10 text-green-500" />
          <h1 className="text-2xl font-bold text-slate-900 uppercase">
            Xác nhận thông tin đặt lịch
          </h1>
          <p className="text-slate-600">
            Vui lòng kiểm tra kỹ thông tin trước khi xác nhận
          </p>
        </div>
      </div>

      {/* Review Info */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Service and Doctor Info in One Row */}
        <div className="p-6 border-b border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Info */}
          <div className="flex items-start gap-3 mb-4">
            <Package className="w-6 h-6 text-sky-400 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                Dịch vụ:{" "}
                <p className="font-bold text-sky-500">
                  {bookingInfo.service.name}
                </p>
              </h3>

              <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                Chuyên khoa:{" "}
                <p className="font-bold text-sky-500">
                  {bookingInfo.service.specialty}
                </p>
              </h3>

              <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                Giá tiền:{" "}
                <p className="font-bold text-sky-500">
                  {bookingInfo.service.discountPrice ? (
                    <>
                      <span className="font-bold text-green-500">
                        {formatPrice(bookingInfo.service.discountPrice)}
                      </span>
                      <span className="text-sm text-slate-400 line-through">
                        {formatPrice(bookingInfo.service.price)}
                      </span>
                    </>
                  ) : (
                    <span className="font-bold text-red-500">
                      {formatPrice(bookingInfo.service.price)}
                    </span>
                  )}
                </p>
              </h3>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="flex items-start gap-3">
            <User className="w-6 h-6 text-sky-400 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                Bác sĩ:{" "}
                <p className="font-bold text-sky-500">
                  {bookingInfo.doctor.name}
                </p>
              </h3>

              <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                Năm kinh nghiệm:{" "}
                <p className="font-bold text-sky-500">
                  {bookingInfo.doctor.experience}
                </p>
              </h3>

              <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                Phòng khám:{" "}
                <p className="font-bold text-sky-500">
                  {bookingInfo.doctor.room}
                </p>
              </h3>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CalendarDays className="w-6 h-6 text-sky-400 flex-shrink-0" />
              <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                Ngày khám:{" "}
                <p className="font-bold text-sky-500">
                  {formatDate(bookingInfo.date)}
                </p>
              </h3>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-sky-400 flex-shrink-0" />
              <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                Giờ khám:{" "}
                <p className="font-bold text-sky-500">{bookingInfo.time}</p>
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => navigate(-1)}
          disabled={submitting}
          className="px-6 py-3 rounded-[var(--rounded)] border border-slate-300 bg-white text-slate-800 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
        >
          Quay lại
        </button>

        <button
          onClick={handleConfirmBooking}
          disabled={submitting}
          className="px-8 py-3 rounded-[var(--rounded)] bg-primary-linear text-white font-semibold transition cursor-pointer"
        >
          {submitting ? (
            <>
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              <span>Xác nhận đặt lịch</span>
            </>
          )}
        </button>
      </div>

      {/* Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Lưu ý:</strong> Sau khi xác nhận, bạn sẽ nhận được mã xác
          nhận. Vui lòng đến đúng giờ và mang theo giấy tờ tùy thân.
        </p>
      </div>
    </div>
  );
};
