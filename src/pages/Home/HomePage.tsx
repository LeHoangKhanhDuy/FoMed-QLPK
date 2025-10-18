import Footer from "../../component/Footer/Footer";
import DoctorClinic from "../../component/Home/DoctorClinic";
import HeroHeader from "../../component/Home/HeroHeader";
import ServiceClinic from "../../component/Home/ServiceClinic";
import Navbar from "../../component/Navbar/Navbar";
import MainLayout from "../../layouts/MainLayout";

export const HomePage = () => {
  return (
    <div>
      <MainLayout>
        <Navbar />
        <HeroHeader />
        <ServiceClinic />
        <DoctorClinic />
        <Footer />
      </MainLayout>
    </div>
  );
};
