import DoctorProfile from "../../component/Doctor/DoctorProfile";
import Footer from "../../component/Footer/Footer";
import Navbar from "../../component/Navbar/Navbar";
import MainLayout from "../../layouts/MainLayout";

export const DoctorProfilePage = () => {
  const doctor = {
    id: 1,
    degree: "Ths BS.",
    name: "Lê Hoàng Thiên",
    avatar:
      "https://medpro.vn/_next/image?url=https%3A%2F%2Fcdn.medpro.vn%2Fprod-partner%2F20af7575-df2e-4224-b40d-36055b476ba6-do-dang-khoa.webp&w=384&q=75",
    specialty: "Nội Tổng Quát",
    experience: "+20 năm kinh nghiệm",
    schedule_type: "T2, T3, T4, T5, T6, T7",
    visitCount: 100,
    star: 4.5,
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
