import LoginForm from "../../component/Auth/LoginForm";
import Footer from "../../component/Footer/Footer";
import Navbar from "../../component/Navbar/Navbar";
import MainLayout from "../../layouts/MainLayout";

export const LoginPage = () => {
  return (
    <div>
      <MainLayout>
        <Navbar />
        <LoginForm/>
        <Footer />
      </MainLayout>
    </div>
  );
};
