import Footer from "../../component/Footer/Footer";
import Navbar from "../../component/Navbar/Navbar";
import ServiceDetails from "../../component/ServiceDetail/ServiceDetails";
import MainLayout from "../../layouts/MainLayout";

export const ServiceDetailPage = () => {
  return (
    <div>
      <MainLayout>
        <Navbar />
        <ServiceDetails />
        <Footer />
      </MainLayout>
    </div>
  );
};
