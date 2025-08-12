import Footer from "../../component/Footer/Footer";
import HeroHeader from "../../component/Home/HeroHeader";
import { Navbar } from "../../component/Navbar/Navbar";
import MainLayout from "../../layouts/MainLayout";

export const HomePage = () => {
  return (
    <div>
      <MainLayout>
        <Navbar />
        <HeroHeader />
        <Footer/>
      </MainLayout>
    </div>
  );
};
