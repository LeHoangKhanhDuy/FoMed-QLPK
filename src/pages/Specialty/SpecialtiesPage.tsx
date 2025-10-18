import Footer from "../../component/Footer/Footer";
import Navbar from "../../component/Navbar/Navbar";
import SpecialtyList from "../../component/Specialties/SpecialtyList";
import MainLayout from "../../layouts/MainLayout";

export const SpecialtyPage = () => {
  return (
    <div>
      <MainLayout>
        <Navbar />
        <SpecialtyList />
        <Footer />
      </MainLayout>
    </div>
  );
};
