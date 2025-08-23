import { useNavigate } from "react-router-dom";
import BookingDate, {
  type ServiceInfo,
} from "../../component/Booking/ServiceBookingDate";
import Footer from "../../component/Footer/Footer";
import { Navbar } from "../../component/Navbar/Navbar";
import MainLayout from "../../layouts/MainLayout";

export const BookingDatePage = () => {
  const navigate = useNavigate();

  // TODO: thay bằng data từ API/route params
  const service: ServiceInfo = {
    name: "Khám bệnh dạ dày",
    address: "429 Tô Hiến Thành, Phường 14, Quận 10, TP. Hồ Chí Minh",
    specialty: "Nội tiêu hoá",
    facilityName: "Trung Tâm Nội Soi Tiêu Hoá Doctor Check",
    verified: true,
  };
  return (
    <div>
      <MainLayout>
        <Navbar />
        <BookingDate
          service={service}
          minDate={new Date()} // khoá ngày quá khứ
          onSelect={(date) => {
            // điều hướng sang trang chọn bác sĩ, gắn query date=YYYY-MM-DD
            const d = date.toISOString().split("T")[0];
            navigate(`/chon-bac-si?date=${d}`);
          }}
        />
        <Footer />
      </MainLayout>
    </div>
  );
};
