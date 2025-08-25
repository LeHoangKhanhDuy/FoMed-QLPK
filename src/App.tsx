import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/Home/HomePage";
import { LoginPage } from "./pages/Auth/LoginPage";
import { SignupPage } from "./pages/Auth/SingupPage";
import { BookingDatePage } from "./pages/Booking/BookingDatePage";
import { BookingDoctorPage } from "./pages/Booking/BookingDoctorPage";
import { BookingPackagePage } from "./pages/Booking/BookingPackagePage";
import { PatientPortalPage } from "./pages/Patient/PatientPortalPage";
import UserProfilePage from "./pages/Account/UserProfilePage";
import UserMedicalHistoryPage from "./pages/Account/UserMedicalHistoryPage";


function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* AUTH */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* BOOKING */}
      <Route path="/booking-doctor" element={<BookingDoctorPage />} />
      <Route
        path="/booking-doctor/booking-date"
        element={<BookingDatePage />}
      />
      <Route path="/booking-package" element={<BookingPackagePage />} />

      {/* PATIENT PORTAL */}
      <Route path="/patient-portal-login" element={<PatientPortalPage />} />

      {/* USER PROFILE */}
      <Route path="/user/profile" element={<UserProfilePage />} />
      <Route path="/user/medical-history" element={<UserMedicalHistoryPage />} />
    </Routes>
  );
}

export default App;
