import { useNavigate } from "react-router-dom";
import Footer from "../../component/Footer/Footer";
import Navbar from "../../component/Navbar/Navbar";
import PatientPortalLogin from "../../component/Patient/PatientPortal";
import MainLayout from "../../layouts/MainLayout";

export const PatientPortalPage = () => {
  const navigate = useNavigate();

  // Xử lý submit theo SĐT
  const handleSubmitPhone = (payload: string) => {
    // Payload format: "phoneDigits" hoặc "phoneDigits|otp"
    const phone = payload.split("|")[0];
    
    // Chuyển sang trang kết quả với thông tin tra cứu theo SĐT
    navigate("/patient-result", {
      state: {
        type: "phone",
        phone: phone,
      },
    });
  };

  // Xử lý submit theo mã hồ sơ
  const handleSubmitRecord = (recordCode: string) => {
    // Chuyển sang trang kết quả với thông tin tra cứu theo mã
    navigate("/patient-result", {
      state: {
        type: "code",
        code: recordCode,
      },
    });
  };

  return (
    <div>
      <MainLayout>
        <Navbar />
        <PatientPortalLogin 
          onSubmitPhone={handleSubmitPhone}
          onSubmitRecord={handleSubmitRecord}
        />
        <Footer />
      </MainLayout>
    </div>
  );
};
