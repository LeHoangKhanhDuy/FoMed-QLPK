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
import UserPrescriptionPage from "./pages/Account/UserPrescriptionPage";
import UserPrescriptionDetailPage from "./pages/Account/UserPrescriptionDetailPage";
import UserMedicalHistoryDetailPage from "./pages/Account/UserMedicalHistoryDetailPage";
import UserLabResultListPage from "./pages/Account/UserLabResultsListPage";
import UserLabResultDetailPage from "./pages/Account/UserLabResultDetailPage";
import { DoctorProfilePage } from "./pages/Doctor/DoctorProfilePage";
import { SpecialtyPage } from "./pages/Specialty/SpecialtiesPage";



function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* AUTH */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* BOOKING */}
      <Route path="/booking-doctor" element={<BookingDoctorPage />} />
      <Route path="/booking-doctor/booking-date" element={<BookingDatePage />}/>
      <Route path="/booking-package" element={<BookingPackagePage />} />

      {/* PATIENT PORTAL */}
      <Route path="/patient-portal-login" element={<PatientPortalPage />} />

      {/* USER PROFILE */}
      <Route path="/user/profile" element={<UserProfilePage />} />
      <Route path="/user/medical-history" element={<UserMedicalHistoryPage />} />
      <Route path="/user/medical-history/detail" element={<UserMedicalHistoryDetailPage />} />
      <Route path="/user/prescriptions" element={<UserPrescriptionPage />} />
      <Route path="/user/prescriptions/details" element={<UserPrescriptionDetailPage />} />
      <Route path="/user/lab-result" element={<UserLabResultListPage />} />
      <Route path="/user/lab-result/detail" element={<UserLabResultDetailPage />} />

      {/* DOCTOR */}
      <Route path="/user/doctor" element={<DoctorProfilePage />} />

      {/* SPECIALTIES */}
      <Route path="/user/specialties" element={<SpecialtyPage />} />
    </Routes>
  );
}

export default App;
