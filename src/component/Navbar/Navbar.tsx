import {
  AlignJustify,
  BadgeInfo,
  ClipboardClock,
  PhoneIcon,
  ScanHeart,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SpecialtyDropdownMenu from "./SpecialtyDropdown";
import MedServiceDropdownMenu from "./MedServiceDropdown";
import HelpMedDropdownMenu from "./HelpMedDropdown";
import mail from "../../assets/images/gmaillogo.png";
import fb from "../../assets/images/facebookLogo.png";
import zalo from "../../assets/images/logoZalo.png";
import logo from "../../assets/images/FoCode Logo.png";
import SpecialtyDropdownMobile from "./SpecialtyDropdownMobile";
import MedServiceDropdownMobile from "./MedServiceDropdownMobile";
import HelpMedDropdownMobile from "./HelpMedDropdownMobile";
import AuthModal from "../Auth/AuthModalProps";

export const Navbar = () => {
  const [visible, setVisible] = useState(true);
  const [prevScroll, setPrevScroll] = useState(0);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > prevScroll && currentScroll > 50) {
        setVisible(false); // scroll xuống
      } else {
        setVisible(true); // scroll lên
      }

      setPrevScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScroll]);

  return (
    <>
      <header
        className={`bg-white lg:sticky lg:top-0 lg:left-0 lg:w-full transition-transform duration-300 ${
          visible ? "lg:translate-y-0" : "lg:-translate-y-full"
        } ${isMobileMenuOpen ? "z-[9999]" : "lg:z-[80]"}`}
      >
        {/* TẦNG TRÊN NAVBAR */}
        <nav className="relative z-auto">
          <div className=" flex flex-col lg:flex-row justify-between items-center px-4 md:px-2 xl:px-0 py-2 md:py-2 xl:py-2 text-sm text-slate-700 max-w-7xl mx-auto gap-y-4 w-full overflow-visible">
            <div className="flex items-center justify-between gap-x-0 md:gap-x-6 w-full lg:w-auto">
              <Link to="/" className="flex-shrink-0">
                <div className="flex items-center">
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-5 w-auto max-[320px]:max-w-[80px]"
                  />
                  <p className="font-bold text-2xl text-sky-500">Med</p>
                </div>
              </Link>

              {/* MẠNG XÃ HỘI */}
              <div className="hidden lg:flex items-center px-2 space-x-6">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.facebook.com/profile.php?id=61577300429551"
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <img src={fb} alt="logoFacebook" className="w-5 h-5" />
                  <span className="text-black font-bold hover:text-[var(--hover)]">
                    Facebook
                  </span>
                </a>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=dev@fotech.pro&su=Hỗ trợ khách hàng&body=Chào%20FoCode%2C%0ATôi%20muốn%20hỏi%20về..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <img src={mail} alt="logoGmail" className="w-5 h-5" />
                  <span className="text-black font-bold hover:text-[var(--hover)]">
                    Gmail
                  </span>
                </a>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=dev@fotech.pro&su=Hỗ trợ khách hàng&body=Chào%20FoCode%2C%0ATôi%20muốn%20hỏi%20về..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <img src={zalo} alt="logoGmail" className="w-5 h-5" />
                  <span className="text-black font-bold hover:text-[var(--hover)]">
                    Zalo
                  </span>
                </a>
              </div>

              {/* MOBILE MENU - FE ONLY */}
              <div className="block lg:hidden relative">
                {/* Nút mở menu */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 ml-auto rounded-md focus:outline-none hover:bg-gray-100 cursor-pointer"
                  aria-label="Mở menu"
                >
                  <AlignJustify className="w-6 h-6" />
                </button>

                {/* Backdrop mờ */}
                {isMobileMenuOpen && (
                  <div
                    className="fixed inset-0 z-[9998] backdrop-brightness-50 bg-black/30 transition-opacity duration-300 cursor-pointer"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-hidden="true"
                  />
                )}

                {/* Slide menu */}
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Menu di động"
                  className={[
                    "fixed top-0 right-0 h-full w-3/4 bg-white z-[9999] shadow-lg p-4 overflow-y-auto",
                    "transform transition-transform duration-300",
                    isMobileMenuOpen ? "translate-x-0" : "translate-x-full",
                  ].join(" ")}
                >
                  {/* Header menu */}
                  <div className="flex items-center justify-between mb-4">
                    {/* Logo mobile */}
                    <div className="flex items-center">
                      <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                        <img
                          src={logo}
                          alt="Logo"
                          className="h-5 w-auto"
                          loading="lazy"
                        />
                      </Link>
                      <p className="font-bold text-2xl text-sky-500">Med</p>
                    </div>

                    {/* Nút đóng */}
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-red-500 cursor-pointer"
                      aria-label="Đóng menu"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* CATEGORY (FE tĩnh) */}
                  <div className="mb-3">
                    <div className="flex flex-col gap-2 text-sm font-semibold">
                      <SpecialtyDropdownMobile />
                      <MedServiceDropdownMobile />
                    </div>
                  </div>

                  <hr className="mt-2 mb-2" />

                  {/* Hành động tài khoản (FE tĩnh) */}
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/user/deposit"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-x-3 -mx-3 rounded-lg px-3 py-2 pr-3.5 pl-3 text-base/7 font-semibold text-gray-900"
                    >
                      <ClipboardClock className="w-8 h-8 rounded-md bg-primary-linear p-1.5 text-white" />
                      Đặt lịch
                    </Link>

                    <Link
                      to="/user/add-product"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-x-3 -mx-3 rounded-lg px-3 py-2 pr-3.5 pl-3 text-base/7 font-semibold text-gray-900"
                    >
                      <ScanHeart className="w-8 h-8 rounded-md bg-orange-400 p-1.5 text-white" />
                      Tra cứu kết quả
                    </Link>
                  </div>
                  <hr className="mt-2 mb-2" />

                  {/* Chức năng (FE tĩnh) */}
                  <div className="flex flex-col space-y-2 mt-2 text-sm font-semibold">
                    <Link
                      to="/help"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-x-3 -mx-3 rounded-lg px-3 py-2 pr-3.5 pl-3 text-base/7 font-semibold text-gray-900"
                    >
                      <BadgeInfo className="w-8 h-8 rounded-md bg-cyan-500 p-1.5 text-white" />
                      Về FoMed
                    </Link>

                    <Link
                      to="/contact"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-x-3 -mx-3 rounded-lg px-3 py-2 pr-3.5 pl-3 text-base/7 font-semibold text-gray-900"
                    >
                      <PhoneIcon className="w-8 h-8 rounded-md bg-teal-400 p-1.5 text-white" />
                      Liên hệ
                    </Link>

                    <HelpMedDropdownMobile />
                  </div>

                  <hr className="my-2" />

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLoginOpen(true);
                    }}
                    className="flex items-center gap-x-3 -mx-3 rounded-lg px-3 py-2 text-base/7 font-bold text-gray-900 hover:bg-gray-50"
                  >
                    <User className="w-7 h-7 rounded-md text-primary" />
                    Đăng nhập
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="flex flex-col sm:flex-row gap-2 items-center lg:flex-row lg:gap-x-4">
              <nav className="items-center gap-x-6 rounded-[var(--rounded)] hidden lg:block border border-sky-500 hover:border-transparent hover:bg-[var(--hover)] group transition-all">
                <button
                  onClick={() => setLoginOpen(true)}
                  className="text-sm rounded-[var(--rounded)] text-sky-500 px-4 py-2.5 cursor-pointer flex items-center gap-2 transition duration-100 group-hover:text-white"
                >
                  <User className="size-4 cursor-pointer" />
                  Đăng nhập
                </button>
              </nav>
            </div>
          </div>
        </nav>

        {/* TẦNG DƯỚI NAVBAR */}
        <nav className="hidden lg:block border-t">
          <div className="flex flex-col lg:flex-row items-center justify-between px-4 md:px-2 xl:px-0 py-4 gap-4 max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold">
              <SpecialtyDropdownMenu />
              <MedServiceDropdownMenu />
              <HelpMedDropdownMenu />
              <Link
                to="/new-code"
                className="hover:text-[var(--hover)] flex justify-center items-center gap-1"
              >
                <BadgeInfo className="w-5 h-5" />
                Về FoMed
              </Link>
              <Link
                to="/free-code"
                className="hover:text-[var(--hover)] flex justify-center items-center gap-1"
              >
                <PhoneIcon className="w-5 h-5" />
                Liên hệ
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                to="/"
                className="bg-primary-linear text-white px-4 py-2 rounded-[var(--rounded)] shadow-sm flex items-center gap-2 text-sm font-bold transition cursor-pointer"
              >
                <ClipboardClock className="size-5" /> Đặt lịch
              </Link>
              <Link
                to="/"
                className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-[var(--rounded)] shadow-sm flex items-center gap-2 text-sm font-bold transition cursor-pointer"
              >
                <ScanHeart className="size-5" /> Tra cứu kết quả
              </Link>
            </div>
          </div>
        </nav>
      </header>
      <AuthModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
};
