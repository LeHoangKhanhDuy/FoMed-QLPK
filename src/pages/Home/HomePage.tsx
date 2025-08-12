import HeroHeader from "../../component/Home/HeroHeader";
import { Navbar } from "../../component/Home/Navbar";
import MainLayout from "../../layouts/MainLayout";

export const HomePage = () => {
  return (
    <div>
      <MainLayout>
        <Navbar />
        <HeroHeader />
      </MainLayout>
    </div>
  );
};
