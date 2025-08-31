import ServiceBookingDoctor from "../../component/Booking/ServiceBookingDoctor";
import Footer from "../../component/Footer/Footer";
import { Navbar } from "../../component/Navbar/Navbar";
import MainLayout from "../../layouts/MainLayout";

export const BookingDoctorPage = () => {
  const service = {
    name: "Gói khám sức khỏe tổng quát",
    facilityName: "Trung Tâm Nội Soi Tiêu Hóa Doctor Check",
    address: "429 Tô Hiến Thành, Phường 14, Quận 10, TP. Hồ Chí Minh",
    specialty: "Khám Nội tổng quát",
  };

  const doctors = [
    {
      id: 1,
      name: "TS.BS Nguyễn Văn A",
      note: "Lịch khám: Thứ 2, 3, 4, 5, 6, 7, CN",
      price: 200000,
      oldPrice: 220000,
      experience: "+20 năm kinh nghiệm",
      verified: true,
    },
    {
      id: 2,
      name: "TS.BS Trần Thị B",
      note: "Lịch khám: Thứ 2, 3, 4, 5, 6, 7, CN",
      price: 200000,
      experience: "+20 năm kinh nghiệm",
      verified: true,
    },
    {
      id: 3,
      name: "TS.BS Lê Văn C",
      note: "Lịch khám: Thứ 2, 3, 4, 5, 6, 7, CN",
      price: 350000,
      experience: "+20 năm kinh nghiệm",
      verified: true,
    },
    {
      id: 4,
      name: "TS.BS Lê Văn C",
      note: "Lịch khám: Thứ 2, 3, 4, 5, 6, 7, CN",
      price: 350000,
      experience: "+20 năm kinh nghiệm",
      verified: true,
    },
    {
      id: 5,
      name: "TS.BS Lê Văn C",
      note: "Lịch khám: Thứ 2, 3, 4, 5, 6, 7, CN",
      price: 350000,
      experience: "+20 năm kinh nghiệm",
      verified: true,
    },
    {
      id: 6,
      name: "TS.BS Lê Văn C",
      note: "Lịch khám: Thứ 2, 3, 4, 5, 6, 7, CN",
      price: 350000,
      experience: "+20 năm kinh nghiệm",
      verified: true,
    },
    {
      id: 7,
      name: "TS.BS Lê Văn C",
      note: "Lịch khám: Thứ 2, 3, 4, 5, 6, 7, CN",
      price: 350000,
      experience: "+20 năm kinh nghiệm",
      verified: true,
    },
    {
      id: 8,
      name: "TS.BS Lê Văn C",
      note: "Lịch khám: Thứ 2, 3, 4, 5, 6, 7, CN",
      price: 350000,
      experience: "+20 năm kinh nghiệm",
      verified: true,
    },
  ];

  return (
    <div>
      <MainLayout>
        <Navbar />
        <ServiceBookingDoctor
          service={service}
          doctors={doctors}
          onDetail={(id) => console.log("Chi tiết bác sĩ", id)}
          onBook={(id) => console.log("Đặt khám với bác sĩ", id)}
        />
        <Footer />
      </MainLayout>
    </div>
  );
};
