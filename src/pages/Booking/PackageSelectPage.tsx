
import ServicePackageSelect from "../../component/Booking/ServicePackageSelect";
import Footer from "../../component/Footer/Footer";
import { Navbar } from "../../component/Navbar/Navbar";
import MainLayout from "../../layouts/MainLayout";

export default function BookingSelectServicePage() {
  return (
    <div>
      <MainLayout>
        <Navbar />
        <ServicePackageSelect />
        <Footer />
      </MainLayout>
    </div>
  );
}
