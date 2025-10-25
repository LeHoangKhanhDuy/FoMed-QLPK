import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ServiceBookingDoctor from "../../component/Booking/ServiceBookingDoctor";
import Footer from "../../component/Footer/Footer";
import Navbar from "../../component/Navbar/Navbar";
import MainLayout from "../../layouts/MainLayout";
import { getService } from "../../services/service";
import {
  apiGetPublicDoctors,
  type DoctorItem,
} from "../../services/doctorMApi";

type ServiceInfo = {
  name: string;
  price: number;
  discountPrice?: number;
  specialty: string;
  verified?: boolean;
  durationMin?: number | null;
};

type Doctor = {
  id: number;
  name: string;
  note?: string;
  experience: string;
  specialty: string;
  verified?: boolean;
};

export const BookingDoctorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const serviceId = searchParams.get("serviceId");

  const [loading, setLoading] = useState(true);
  const [serviceInfo, setServiceInfo] = useState<ServiceInfo | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!serviceId) {
        toast.error("Không tìm thấy thông tin dịch vụ");
        setLoading(false);
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
          setLoading(false);
          return;
        }

        // Map dữ liệu dịch vụ
        setServiceInfo({
          name: selectedService.name,
          price: selectedService.basePrice ?? 0,
          specialty: selectedService.category?.name || "Chuyên khoa tổng hợp",
          verified: true,
          durationMin: selectedService.durationMin,
        });

        // 2. Lấy danh sách bác sĩ công khai
        const doctorsRes = await apiGetPublicDoctors({
          page: 1,
          limit: 100,
        });

        // Map dữ liệu bác sĩ
        const mappedDoctors: Doctor[] = doctorsRes.items.map(
          (d: DoctorItem) => ({
            id: d.doctorId,
            name: d.fullName,
            note: d.roomName ? `Phòng khám: ${d.roomName}` : undefined,
            experience: d.experienceYears
              ? `+${d.experienceYears} năm kinh nghiệm`
              : "Kinh nghiệm chuyên môn",
            specialty: d.primarySpecialtyName || "Chuyên khoa tổng hợp",
            verified: d.isActive,
          })
        );

        setDoctors(mappedDoctors);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId]);

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctorId(doctor.id);
  };

  const handleBookDoctor = (doctorId: number) => {
    // Chuyển sang trang chọn ngày với serviceId và doctorId
    navigate(
      `/booking-doctor/booking-date?serviceId=${serviceId}&doctorId=${doctorId}`
    );
  };

  if (loading) {
    return (
      <div>
        <MainLayout>
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-20">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Loading ServiceInfoCard */}
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
              {/* Loading Doctors List */}
              <div className="md:col-span-2">
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-pulse">
                  <div className="px-4 py-3 bg-gray-200 h-12"></div>
                  <div className="p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </MainLayout>
      </div>
    );
  }

  if (!serviceInfo) {
    return (
      <div>
        <MainLayout>
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <p className="text-gray-600 text-lg">
              Không tìm thấy thông tin dịch vụ
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
        <ServiceBookingDoctor
          service={serviceInfo}
          doctors={doctors}
          selectedDoctorId={selectedDoctorId}
          onDetail={(id) => navigate(`/user/doctor/${id}`)}
          onSelectDoctor={handleSelectDoctor}
          onBook={handleBookDoctor}
        />
        <Footer />
      </MainLayout>
    </div>
  );
};
