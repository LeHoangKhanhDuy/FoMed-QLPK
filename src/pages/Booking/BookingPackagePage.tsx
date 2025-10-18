
import BookingPackages from "../../component/Booking/BookingPackage";
import Footer from "../../component/Footer/Footer";
import Navbar from "../../component/Navbar/Navbar";
import MainLayout from "../../layouts/MainLayout";

export const BookingPackagePage = () => {

  return (
    <div>
      <MainLayout>
        <Navbar />
        <BookingPackages/>
        <Footer />
      </MainLayout>
    </div>
  );
};
