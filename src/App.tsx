import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/Home/HomePage";
import { LoginPage } from "./pages/Auth/LoginPage";
import { SignupPage } from "./pages/Auth/SingupPage";
import { BookingDatePage } from "./pages/Booking/BookingDatePage";
import { BookingDoctorPage } from "./pages/Booking/BookingDoctorPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/booking-doctor" element={<BookingDoctorPage />} />
      <Route path="/booking-date" element={<BookingDatePage />} />
    </Routes>
  );
}

export default App;
