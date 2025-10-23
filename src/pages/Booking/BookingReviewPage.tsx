import { BookingReview } from "../../component/Booking/BookingReview";
import Footer from "../../component/Footer/Footer";
import Navbar from "../../component/Navbar/Navbar";
import MainLayout from "../../layouts/MainLayout";

export default function BookingReviewPage() {
  return (
    <div>
      <MainLayout>
        <Navbar />
        <BookingReview />
        <Footer />
      </MainLayout>
    </div>
  );
}
