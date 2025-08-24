
import Footer from "../../component/Footer/Footer";
import { Navbar } from "../../component/Navbar/Navbar";
import PatientPortalLogin from "../../component/Patient/PatientPortal";
import MainLayout from "../../layouts/MainLayout";

export const PatientPortalPage = () => {
  return (
    <div>
      <MainLayout>
        <Navbar />
        <PatientPortalLogin />
        <Footer />
      </MainLayout>
    </div>
  );
};
