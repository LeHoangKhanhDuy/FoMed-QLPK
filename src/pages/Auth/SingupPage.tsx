
import SignUpForm from "../../component/Auth/SignupForm";
import Footer from "../../component/Footer/Footer";
import { Navbar } from "../../component/Navbar/Navbar";
import MainLayout from "../../layouts/MainLayout";

export const SignupPage = () => {
  return (
    <div>
      <MainLayout>
        <Navbar />
        <SignUpForm />
        <Footer />
      </MainLayout>
    </div>
  );
};
