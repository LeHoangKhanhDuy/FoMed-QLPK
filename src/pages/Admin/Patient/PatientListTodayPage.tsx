import { useEffect, useState } from "react";
import PatientListToday from "../../../component/Admin/Patient/PatientListToday";
import CSMLayout from "../../../layouts/CMSLayout";
import { appointmentsList } from "../../../services/appointmentsApi";
import type { BEAppointment } from "../../../services/appointmentsApi";
import toast from "react-hot-toast";

export const PatientListTodayAdminPage = () => {
  const [appointments, setAppointments] = useState<BEAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayAppointments = async () => {
      try {
        setLoading(true);
        
        // Lấy appointments của ngày hôm nay
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const result = await appointmentsList({
          date: today,
          page: 1,
          limit: 100, // Lấy nhiều để đảm bảo có đủ dữ liệu
        });
        
        setAppointments(result.items);
      } catch (error) {
        console.error("Error fetching today's appointments:", error);
        toast.error("Không thể tải danh sách bệnh nhân hôm nay");
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayAppointments();
  }, []);

  if (loading) {
    return (
      <CSMLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách bệnh nhân...</p>
          </div>
        </div>
      </CSMLayout>
    );
  }

  return (
    <CSMLayout>
      <PatientListToday 
        items={appointments} 
        title="Danh sách bệnh nhân hôm nay"
      />
    </CSMLayout>
  );
};
