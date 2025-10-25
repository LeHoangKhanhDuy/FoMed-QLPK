import Footer from "../../component/Footer/Footer";
import Navbar from "../../component/Navbar/Navbar";
import { PatientResult } from "../../component/Patient/PatientResult";
import MainLayout from "../../layouts/MainLayout";

export const PatientResultPage = () => {
  return (
    <div>
      <MainLayout>
        <Navbar />
        <PatientResult />
        <Footer />
      </MainLayout>
    </div>
  );
};
