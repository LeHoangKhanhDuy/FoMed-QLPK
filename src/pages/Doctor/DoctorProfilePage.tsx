import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import DoctorProfile from "../../component/Doctor/DoctorProfile";
import Footer from "../../component/Footer/Footer";
import Navbar from "../../component/Navbar/Navbar";
import MainLayout from "../../layouts/MainLayout";
import { apiGetDoctorDetail, type DoctorDetail } from "../../services/doctorMApi";

export const DoctorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState<DoctorDetail | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!id) {
        toast.error("Không tìm thấy thông tin bác sĩ");
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        const data = await apiGetDoctorDetail(Number(id));
        setDoctorData(data);
      } catch (error) {
        console.error("Error fetching doctor:", error);
        toast.error("Không thể tải thông tin bác sĩ");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id, navigate]);

  if (loading) {
    return (
      <div>
        <MainLayout>
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 xl:px-0 py-20 min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
          </div>
          <Footer />
        </MainLayout>
      </div>
    );
  }

  if (!doctorData) {
    return (
      <div>
        <MainLayout>
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 xl:px-0 py-20 min-h-screen flex items-center justify-center">
            <p className="text-gray-600">Không tìm thấy thông tin bác sĩ</p>
          </div>
          <Footer />
        </MainLayout>
      </div>
    );
  }

  // Map DoctorDetail từ API sang format Doctor component cần
  const doctor = {
    id: doctorData.doctorId,
    degree: doctorData.title || "BS.",
    name: doctorData.fullName,
    avatar: doctorData.avatarUrl || "",
    specialty: doctorData.primarySpecialtyName || "Chuyên khoa tổng hợp",
    experience: doctorData.experienceYears 
      ? `+${doctorData.experienceYears} năm kinh nghiệm`
      : "Kinh nghiệm chuyên môn",
    schedule_type: doctorData.weeklySlots.length > 0 
      ? doctorData.weeklySlots.map(s => s.dayOfWeek).join(", ")
      : "Hẹn khám",
    visitCount: doctorData.visitCount || 0,
    star: doctorData.ratingAvg || 5.0,
    intro: doctorData.intro,
    educations: doctorData.educations,
    expertises: doctorData.expertises,
    achievements: doctorData.achievements,
  };

  return (
    <div>
      <MainLayout>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 xl:px-0 py-6">
          <DoctorProfile doctor={doctor} />
        </div>
        <Footer />
      </MainLayout>
    </div>
  );
};
