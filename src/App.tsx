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
import DoctorListPage from "./pages/Doctor/DoctorListPage";
import BookingSelectServicePage from "./pages/Booking/PackageSelectPage";
import { DashboardPage } from "./pages/Admin/Dashboard/DashboardPage";
import { AppointmentCreatePage } from "./pages/Admin/Appointment/AppointmentCreatePage";
import { DoctorScheduleAdminPage } from "./pages/Admin/Doctor/DoctorScheduleAdminPage";
import { PatientListTodayAdminPage } from "./pages/Admin/Patient/PatientListTodayPage";
import { DoctorPatientListWorkspacePage } from "./pages/Admin/Patient/DoctorPatientWorkspacePage";



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
      <Route path="/booking/select-service" element={<BookingSelectServicePage />} />

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
      <Route path="/user/doctor-list" element={<DoctorListPage />} />

      {/* SPECIALTIES */}
      <Route path="/user/specialties" element={<SpecialtyPage />} />

      {/* CSM ADMIN */}
      <Route path="/cms/dashboard" element={<DashboardPage />} />
      <Route path="/cms/create-appointments" element={<AppointmentCreatePage />} />
      <Route path="/cms/doctor-schedule" element={<DoctorScheduleAdminPage />} />
      <Route path="/cms/patient-list" element={<PatientListTodayAdminPage />} />
      <Route path="/cms/patient-list/workspace" element={<DoctorPatientListWorkspacePage />} />
    </Routes>
  );
}

export default App;
