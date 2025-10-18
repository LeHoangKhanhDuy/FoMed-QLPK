import DoctorList from "../../component/Doctor/DoctorList";
import Footer from "../../component/Footer/Footer";
import Navbar from "../../component/Navbar/Navbar";
import MainLayout from "../../layouts/MainLayout";

const doctors = [
  {
    id: 1,
    name: "BS. Hồ Thị Thu Hồng",
    title: "Bác sĩ Tim mạch",
    specialty: "20 năm kinh nghiệm",
    experience: "ĐH Y Dược TPHCM, 1982 - 1988",
    education: "Y Đa Khoa",
    image:
      "https://medpro.vn/_next/image?url=https%3A%2F%2Fcdn.medpro.vn%2Fprod-partner%2F20af7575-df2e-4224-b40d-36055b476ba6-do-dang-khoa.webp&w=384&q=75",
  },
  {
    id: 2,
    name: "BS. CKII. Nguyễn Thị Ngọc Loan",
    title: "Bác sĩ Nội tổng quát",
    specialty: "20 năm kinh nghiệm",
    experience: "Trường ĐH Y Khoa Phạm Ngọc Thạch",
    education: "Chuyên khoa II, 2014 - 2016",
    image:
      "https://medpro.vn/_next/image?url=https%3A%2F%2Fcdn.medpro.vn%2Fprod-partner%2F20af7575-df2e-4224-b40d-36055b476ba6-do-dang-khoa.webp&w=384&q=75",
  },
  {
    id: 3,
    name: "BS. CKII. Nguyễn Thị Ngọc Loan",
    title: "Bác sĩ Nội tổng quát",
    specialty: "20 năm kinh nghiệm",
    experience: "Trường ĐH Y Khoa Phạm Ngọc Thạch",
    education: "Chuyên khoa II, 2014 - 2016",
    image:
      "https://medpro.vn/_next/image?url=https%3A%2F%2Fcdn.medpro.vn%2Fprod-partner%2F20af7575-df2e-4224-b40d-36055b476ba6-do-dang-khoa.webp&w=384&q=75",
  },
  {
    id: 4,
    name: "BS. CKII. Nguyễn Thị Ngọc Loan",
    title: "Bác sĩ Nội tổng quát",
    specialty: "20 năm kinh nghiệm",
    experience: "Trường ĐH Y Khoa Phạm Ngọc Thạch",
    education: "Chuyên khoa II, 2014 - 2016",
    image:
      "https://medpro.vn/_next/image?url=https%3A%2F%2Fcdn.medpro.vn%2Fprod-partner%2F20af7575-df2e-4224-b40d-36055b476ba6-do-dang-khoa.webp&w=384&q=75",
  },
  // ... các bác sĩ khác
];

export default function DoctorListPage() {
  return (
    <MainLayout>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 xl:px-0 py-8 md:py-14">
        <h2 className="text-3xl md:text-5xl font-bold text-sky-400 text-center mb-4">
          Danh sách bác sĩ
        </h2>
        <p className="text-lg text-center text-slate-600 mb-8">
          Bác sĩ đến từ những bệnh viện hàng đầu Việt Nam
        </p>
        <DoctorList
          doctors={doctors}
          onSelect={(id) => console.log("Chọn:", id)}
        />
      </div>
      <Footer />
    </MainLayout>
  );
}
