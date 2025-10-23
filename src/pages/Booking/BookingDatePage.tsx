import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Footer from "../../component/Footer/Footer";
import Navbar from "../../component/Navbar/Navbar";
import MainLayout from "../../layouts/MainLayout";
import { getService } from "../../services/service";
import { apiGetDoctorDetail } from "../../services/doctorMApi";
import BookingDate from "../../component/Booking/ServiceBookingDate";

export const BookingDatePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const serviceId = searchParams.get("serviceId");
  const doctorId = searchParams.get("doctorId");

  const [loading, setLoading] = useState(true);
  const [serviceInfo, setServiceInfo] = useState<{
    name: string;
    address: string;
    specialty: string;
    facilityName: string;
    verified?: boolean;
    price: number;
    durationMin?: number | null;
  } | null>(null);

  const [doctorInfo, setDoctorInfo] = useState<{
    name: string;
    experience: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!serviceId || !doctorId) {
        toast.error("Thiếu thông tin dịch vụ hoặc bác sĩ");
        navigate(-1);
        return;
      }

      try {
        setLoading(true);

        // 1. Lấy thông tin dịch vụ
        const serviceRes = await getService({
          page: 1,
          pageSize: 100,
          isActive: true,
        });

        const selectedService = serviceRes.data.items.find(
          (s) => s.serviceId === Number(serviceId)
        );

        if (!selectedService) {
          toast.error("Không tìm thấy dịch vụ");
          navigate(-1);
          return;
        }

        // 2. Lấy thông tin bác sĩ
        const doctor: any = await apiGetDoctorDetail(Number(doctorId));

        setServiceInfo({
          name: selectedService.name,
          address: "Trung Tâm Nội Soi Tiêu Hoá Doctor Check",
          specialty: selectedService.category?.name || "Chuyên khoa tổng hợp",
          facilityName: "Trung Tâm Nội Soi Tiêu Hoá Doctor Check",
          verified: true,
          price: selectedService.basePrice ?? 0,
          durationMin: selectedService.durationMin,
        });

        setDoctorInfo({
          name: doctor.fullName || "Bác sĩ",
          experience: doctor.experienceYears
            ? `${doctor.experienceYears} năm kinh nghiệm`
            : "Kinh nghiệm chuyên môn",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Không thể tải dữ liệu");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId, doctorId, navigate]);

  const handleSelectDateTime = (dateTime: Date) => {
    // Lưu thông tin đã chọn và chuyển sang trang review
    const params = new URLSearchParams({
      serviceId: serviceId!,
      doctorId: doctorId!,
      visitDate: dateTime.toISOString().split("T")[0], // yyyy-MM-dd
      visitTime: dateTime.toTimeString().split(" ")[0], // HH:mm:ss
    });

    navigate(`/booking-doctor/review?${params.toString()}`);
  };

  if (loading) {
    return (
      <div>
        <MainLayout>
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-20">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-pulse">
                  <div className="px-4 py-3 bg-gray-200 h-12"></div>
                  <div className="p-4 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-pulse">
                  <div className="px-4 py-3 bg-gray-200 h-12"></div>
                  <div className="p-4 h-96 bg-gray-100"></div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </MainLayout>
      </div>
    );
  }

  if (!serviceInfo || !doctorInfo) {
    return (
      <div>
        <MainLayout>
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <p className="text-gray-600 text-lg">
              Không tìm thấy thông tin đặt lịch
            </p>
          </div>
          <Footer />
        </MainLayout>
      </div>
    );
  }

  return (
    <div>
      <MainLayout>
        <Navbar />
        <BookingDate
          service={serviceInfo}
          doctorInfo={doctorInfo}
          serviceId={serviceId!}
          doctorId={doctorId!}
          onSelectTime={handleSelectDateTime}
          minDate={new Date()}
          startHour={6}
          endHour={18}
          stepMinutes={60}
        />
        <Footer />
      </MainLayout>
    </div>
  );
};
