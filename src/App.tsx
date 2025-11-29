import { Outlet, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/Home/HomePage";
import { LoginPage } from "./pages/Auth/LoginPage";
import { SignupPage } from "./pages/Auth/SingupPage";
import { BookingDatePage } from "./pages/Booking/BookingDatePage";
import { BookingDoctorPage } from "./pages/Booking/BookingDoctorPage";
import { BookingPackagePage } from "./pages/Booking/BookingPackagePage";
import { PatientPortalPage } from "./pages/Patient/PatientPortalPage";
import { PatientResultPage } from "./pages/Patient/PatientResultPage";
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
import { DoctorPatientListWorkspacePage } from "./pages/Admin/Patient/DoctorPatientWorkspacePage";
import { UserManagerPage } from "./pages/Admin/User/UserManagerPage";
import { ServiceManagerPage } from "./pages/Admin/ServiceManager/ServiceManagerPage";
import { DrugManagerPage } from "./pages/Admin/Drug/DrugManagerPage";
import { Toaster } from "react-hot-toast";
import { BillingManagerPage } from "./pages/Admin/BillingMangerPage/BillingManagerPage";
import { InvoicePaymentManagerPage } from "./pages/Admin/BillingMangerPage/InvoicePaymentManagerPage";
import { InvoiceDetailPaymentPage } from "./pages/Admin/BillingMangerPage/InvoiceDetailPaymentPage";
import RequireCMSRole from "./auth/RequireCMSRole";
import { PatientManagerPage } from "./pages/Admin/Patient/PatientMangerPage";
import AppointmentListPage from "./pages/Admin/Appointment/AppointmentListPage";
import { DoctorManagerPage } from "./pages/Admin/Doctor/DoctorManagerPage";
import { SpecialtyManagerPage } from "./pages/Admin/Specialty/SpecialtyManagerPage";
import BookingReviewPage from "./pages/Booking/BookingReviewPage";
import {
  NotFoundPage,
  ForbiddenPage,
  ServerErrorPage,
  MaintenancePage,
} from "./pages/Error";
import UserAppointmentSchedulePage from "./pages/Account/UserAppointmentShedulePage";

function CmsGuard() {
  return (
    <RequireCMSRole>
      <Outlet />
    </RequireCMSRole>
  );
}

function App() {
  return (
    <>
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
        <Route
          path="/booking/select-service"
          element={<BookingSelectServicePage />}
        />
        <Route path="/booking-service" element={<BookingSelectServicePage />} />
        <Route path="/booking-doctor/review" element={<BookingReviewPage />} />

        {/* PATIENT PORTAL */}
        <Route path="/patient-portal-login" element={<PatientPortalPage />} />
        <Route path="/patient-result" element={<PatientResultPage />} />

        {/* USER PROFILE */}
        <Route path="/user/profile" element={<UserProfilePage />} />
        <Route
          path="/user/medical-history"
          element={<UserMedicalHistoryPage />}
        />
        <Route
          path="/user/medical-history/:rxId"
          element={<UserMedicalHistoryDetailPage />}
        />
        <Route path="/user/prescriptions" element={<UserPrescriptionPage />} />
        <Route
          path="/user/prescriptions/details"
          element={<UserPrescriptionDetailPage />}
        />
        <Route path="/user/lab-result" element={<UserLabResultListPage />} />
        <Route
          path="/user/lab-result/detail"
          element={<UserLabResultDetailPage />}
        />
        <Route
          path="/user/appointment-shedule"
          element={<UserAppointmentSchedulePage />}
        />

        {/* DOCTOR */}
        <Route path="/user/doctor/:id" element={<DoctorProfilePage />} />
        <Route path="/user/doctor-list" element={<DoctorListPage />} />

        {/* SPECIALTIES */}
        <Route path="specialties" element={<SpecialtyPage />} />

        {/* CSM ADMIN */}
        <Route path="/cms" element={<CmsGuard />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route
            path="create-appointments"
            element={<AppointmentCreatePage />}
          />
          <Route path="doctor-schedule" element={<DoctorScheduleAdminPage />} />
          <Route path="patient-list-today" element={<AppointmentListPage />} />
          <Route
            path="patient-list/workspace"
            element={<DoctorPatientListWorkspacePage />}
          />
          <Route path="patient-manager" element={<PatientManagerPage />} />
          <Route path="users-manager" element={<UserManagerPage />} />
          <Route path="service-manager" element={<ServiceManagerPage />} />
          <Route path="drug-manager" element={<DrugManagerPage />} />
          <Route path="billing" element={<BillingManagerPage />} />
          <Route
            path="billing/payment/:invoiceId"
            element={<InvoicePaymentManagerPage />}
          />
          <Route
            path="billing/details/:invoiceId"
            element={<InvoiceDetailPaymentPage />}
          />
          <Route path="doctor-manager" element={<DoctorManagerPage />} />
          <Route path="specialty-manager" element={<SpecialtyManagerPage />} />
        </Route>

        {/* ERROR PAGES */}
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontSize: 16 },
        }}
      />
    </>
  );
}

export default App;
