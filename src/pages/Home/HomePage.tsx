import Footer from "../../component/Footer/Footer";
import FavoriteClinic from "../../component/Home/FavoriteClinic";
import HeroHeader from "../../component/Home/HeroHeader";
import ServiceClinic from "../../component/Home/ServiceClinic";
import { Navbar } from "../../component/Navbar/Navbar";
import MainLayout from "../../layouts/MainLayout";

export const HomePage = () => {
  return (
    <div>
      <MainLayout>
        <Navbar />
        <HeroHeader />
        <FavoriteClinic/>
        <ServiceClinic/>
        <Footer/>
      </MainLayout>
    </div>
  );
};
