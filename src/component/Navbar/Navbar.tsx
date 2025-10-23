import {
  AlignJustify,
  BadgeInfo,
  ClipboardClock,
  Hospital,
  PhoneIcon,
  ScanHeart,
  User,
  X,
  MousePointerSquareDashed,
  CircleUserRound,
  Heart,
  Settings,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import MedServiceDropdownMenu from "./MedServiceDropdown";
import HelpMedDropdownMenu from "./HelpMedDropdown";
import MedServiceDropdownMobile from "./MedServiceDropdownMobile";
import HelpMedDropdownMobile from "./HelpMedDropdownMobile";

import AuthModal from "../Auth/AuthModalProps";
import type { AppUser } from "../../types/auth/login";

import mail from "../../assets/images/gmaillogo.png";
import fb from "../../assets/images/facebookLogo.png";
import zalo from "../../assets/images/logoZalo.png";
import logo from "../../assets/images/FoCode Logo.png";
import {
  ensureAuthFromStorage,
  logout as logoutApi,
} from "../../services/auth";
import toast from "react-hot-toast";

const USER_INFO_KEY = "userInfo";

const readUserFromStorage = (): AppUser | null => {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as unknown;
    if (obj && typeof obj === "object" && "email" in obj) {
      const u = obj as AppUser;
      return {
        userId: u.userId,
        email: u.email,
        name: u.name,
        phone: u.phone,
        roles: Array.isArray(u.roles) ? u.roles : [],
      };
    }
    return null;
  } catch {
    return null;
  }
};

export default function Navbar() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);
  const [prevScroll, setPrevScroll] = useState(0);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState<AppUser | null>(readUserFromStorage());
  //const [cartCount] = useState(0); // TODO: Lấy từ cart context/store

  // nhận user trực tiếp khi đăng nhập thành công từ AuthModal
  const handleAuthSuccess = (u: AppUser) => {
    setUser(u);
    setLoginOpen(false);

    // Lấy URL lưu trong localStorage và điều hướng đến đó
    const redirectUrl = localStorage.getItem("redirectAfterLogin");
    if (redirectUrl) {
      navigate(redirectUrl);
      localStorage.removeItem("redirectAfterLogin"); // Xóa URL sau khi đã sử dụng
    }
  };

  // đồng bộ khi modal đóng (backup)
  useEffect(() => {
    if (!isLoginOpen) setUser(readUserFromStorage());
  }, [isLoginOpen]);

  useEffect(() => {
    ensureAuthFromStorage();
    setUser(readUserFromStorage());
  }, []);

  // sync đa tab & nơi khác bằng storage + custom event
  useEffect(() => {
    const sync = () => setUser(readUserFromStorage());
    window.addEventListener("storage", sync);
    window.addEventListener("auth:updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth:updated", sync);
    };
  }, []);

  // Ẩn/hiện navbar theo scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setVisible(!(currentScroll > prevScroll && currentScroll > 50));
      setPrevScroll(currentScroll);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScroll]);

  const handleLogout = async () => {
    try {
      await logoutApi();
      toast.success("Đăng xuất thành công");
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Đăng xuất thất bại");
    }
  };

  const handleBookingClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Kiểm tra đăng nhập
    const user = localStorage.getItem("userInfo");
    const token = localStorage.getItem("userToken");

    if (!user || !token) {
      toast.error("Vui lòng đăng nhập để đặt lịch khám!");
      // Lưu URL hiện tại để redirect sau khi đăng nhập
      localStorage.setItem("redirectAfterLogin", "/booking-package");
      setLoginOpen(true); // Hiển thị modal đăng nhập
      return;
    }

    // Nếu đã đăng nhập, cho phép vào trang đặt lịch
    navigate("/booking-package");
  };

  const displayName = user?.name?.trim() || user?.email || "User";
  const userAvatar = "https://cdn-icons-png.flaticon.com/512/219/219983.png"; // TODO: Lấy từ user.avatar

  return (
    <>
      <header
        className={`bg-white shadow-xs lg:sticky lg:top-0 lg:left-0 lg:w-full transition-transform duration-300 ${
          visible ? "lg:translate-y-0" : "lg:-translate-y-full"
        } ${isMobileMenuOpen ? "z-[9999]" : "lg:z-[80]"}`}
      >
        {/* ===== TẦNG TRÊN NAVBAR ===== */}
        <nav className="relative z-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center px-4 md:px-2 xl:px-0 py-2 md:py-2 xl:py-2 text-sm text-slate-700 max-w-7xl mx-auto gap-y-4 w-full overflow-visible">
            {/* LEFT: Logo + social + mobile menu */}
            <div className="flex items-center justify-between gap-x-0 md:gap-x-6 w-full lg:w-auto">
              <Link to="/" className="flex-shrink-0 cursor-pointer">
                <div className="flex items-center">
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-5 w-auto max-[320px]:max-w-[80px]"
                    loading="lazy"
                  />
                  <p className="font-bold text-2xl text-sky-500">Med</p>
                </div>
              </Link>

              {/* Mạng xã hội (desktop) */}
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
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=dev@fotech.pro"
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
                  href="https://zalo.me/your-zalo-id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <img src={zalo} alt="logoZalo" className="w-5 h-5" />
                  <span className="text-black font-bold hover:text-[var(--hover)]">
                    Zalo
                  </span>
                </a>
              </div>

              {/* MOBILE MENU BUTTON */}
              <div className="block lg:hidden relative">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 ml-auto rounded-md focus:outline-none hover:bg-gray-100 cursor-pointer"
                  aria-label="Mở menu"
                >
                  <AlignJustify className="w-6 h-6" />
                </button>

                {/* Backdrop */}
                {isMobileMenuOpen && (
                  <div
                    className="fixed inset-0 z-[9998] backdrop-brightness-50 bg-black/30 transition-opacity duration-300 cursor-pointer"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-hidden="true"
                  />
                )}

                {/* Slide menu mobile */}
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
                    <div className="flex items-center">
                      <Link
                        to="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className="cursor-pointer"
                      >
                        <img
                          src={logo}
                          alt="Logo"
                          className="h-5 w-auto"
                          loading="lazy"
                        />
                      </Link>
                      <p className="font-bold text-2xl text-sky-500">Med</p>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-red-500 cursor-pointer"
                      aria-label="Đóng menu"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Menu items mobile */}
                  <div className="mb-3">
                    <div className="flex flex-col gap-2 text-sm font-semibold">
                      <MedServiceDropdownMobile />
                      <Link
                        to="/user/specialties"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-x-3 -mx-3 rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 cursor-pointer"
                      >
                        <Hospital className="w-8 h-8 rounded-md bg-primary-linear p-1.5 text-white" />
                        Chuyên khoa
                      </Link>
                    </div>
                  </div>

                  <hr className="mt-2 mb-2" />

                  <div className="flex flex-col gap-2">
                    <Link
                      to="/booking-package"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-x-3 -mx-3 rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 cursor-pointer"
                    >
                      <ClipboardClock className="w-8 h-8 rounded-md bg-primary-linear p-1.5 text-white" />
                      Đặt lịch
                    </Link>

                    <Link
                      to="/patient-portal-login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-x-3 -mx-3 rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 cursor-pointer"
                    >
                      <ScanHeart className="w-8 h-8 rounded-md bg-orange-400 p-1.5 text-white" />
                      Tra cứu kết quả
                    </Link>
                  </div>

                  <hr className="mt-2 mb-2" />

                  <div className="flex flex-col space-y-2 mt-2 text-sm font-semibold">
                    <Link
                      to="/help"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-x-3 -mx-3 rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 cursor-pointer"
                    >
                      <BadgeInfo className="w-8 h-8 rounded-md bg-cyan-500 p-1.5 text-white" />
                      Về FoMed
                    </Link>

                    <Link
                      to="/contact"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-x-3 -mx-3 rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 cursor-pointer"
                    >
                      <PhoneIcon className="w-8 h-8 rounded-md bg-teal-400 p-1.5 text-white" />
                      Liên hệ
                    </Link>

                    <HelpMedDropdownMobile />
                  </div>

                  <hr className="my-2" />

                  {/* User section mobile */}
                  {user ? (
                    <>
                      <div className="px-3 py-2 font-bold text-gray-900">
                        Xin chào, {displayName}
                      </div>
                      <Link
                        to="/user/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-x-3 -mx-3 rounded-lg px-3 py-2 text-base/7 font-bold text-gray-900 hover:bg-gray-50 cursor-pointer"
                      >
                        <User className="w-7 h-7 text-primary" /> Hồ sơ của tôi
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-x-3 -mx-3 rounded-lg px-3 py-2 text-base/7 font-bold text-gray-900 hover:bg-gray-50 cursor-pointer w-full text-left"
                      >
                        <LogOut className="w-7 h-7 text-red-500" /> Đăng xuất
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setLoginOpen(true);
                      }}
                      className="flex items-center gap-x-3 -mx-3 rounded-lg px-3 py-2 text-base/7 font-bold text-gray-900 hover:bg-gray-50 cursor-pointer"
                    >
                      <User className="w-7 h-7 rounded-md text-primary" />
                      Đăng nhập
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: User section desktop */}
            <div className="flex flex-col sm:flex-row gap-2 items-center lg:flex-row lg:gap-x-4">
              {user ? (
                <div className="flex items-center gap-x-3">
                  {/* GIỎ HÀNG DESKTOP */}
                  {/* <button
                    onClick={() => {
                      if (cartCount === 0) {
                        navigate("/cart-empty");
                      } else {
                        navigate("/shopping-cart");
                      }
                    }}
                    className="relative hidden lg:flex items-center gap-2 px-4 py-2.5 bg-gray-200/50 rounded-full text-sm font-bold text-black hover:text-[var(--hover)] transition duration-200 cursor-pointer"
                  >
                    <ShoppingBag className="size-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 left-10 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </button> */}

                  {/* AVATAR + DROPDOWN MENU */}
                  <Menu as="div" className="relative hidden lg:flex">
                    <MenuButton className="relative flex rounded-[var(--rounded)] text-sm cursor-pointer group outline-0">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <div className="flex items-center gap-x-2 rounded-[var(--rounded)] border border-gray-300 px-4 py-2.5 hover:border-[var(--hover)] transition-all">
                        <img
                          src={userAvatar}
                          alt="User Avatar"
                          className="w-5 h-5 rounded-full object-cover"
                          loading="lazy"
                        />
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-[var(--hover)]">
                          {displayName}
                        </span>
                        <MousePointerSquareDashed className="w-4 h-4 text-gray-500 group-hover:text-[var(--hover)]" />
                      </div>
                    </MenuButton>

                    <MenuItems
                      transition
                      anchor="bottom end"
                      className="w-72 z-[100] origin-top-right rounded-xl border border-gray-200 bg-white py-2 text-sm text-gray-900 shadow-lg transition duration-300 ease-out [--anchor-gap:8px] focus:outline-none data-closed:scale-95 data-closed:opacity-0 mt-2"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <img
                          src={userAvatar}
                          alt="User Avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs text-gray-500">Xin chào,</p>
                          <p className="text-base font-bold text-[var(--primary)]">
                            {displayName}
                          </p>
                        </div>
                      </div>

                      <div className="my-1 h-px bg-gray-200" />

                      {/* Menu items */}
                      <MenuItem>
                        <Link
                          to="/user/profile"
                          className="group flex w-full items-center gap-3 font-semibold px-4 py-2.5 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <CircleUserRound className="size-5 text-gray-500 group-hover:text-[var(--hover)]" />
                          <span className="group-hover:text-[var(--hover)]">
                            Cài đặt tài khoản
                          </span>
                        </Link>
                      </MenuItem>

                      <MenuItem>
                        <Link
                          to="/user/favorite"
                          className="group flex w-full items-center gap-3 font-semibold px-4 py-2.5 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <Heart className="size-5 text-gray-500 group-hover:text-[var(--hover)]" />
                          <span className="group-hover:text-[var(--hover)]">
                            Sản phẩm yêu thích
                          </span>
                        </Link>
                      </MenuItem>

                      <MenuItem>
                        <Link
                          to="/user/details/change-password"
                          className="group flex w-full items-center gap-3 font-semibold px-4 py-2.5 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <Settings className="size-5 text-gray-500 group-hover:text-[var(--hover)]" />
                          <span className="group-hover:text-[var(--hover)]">
                            Đổi mật khẩu
                          </span>
                        </Link>
                      </MenuItem>

                      <div className="my-1 h-px bg-gray-200" />

                      <MenuItem>
                        <button
                          onClick={handleLogout}
                          className="group flex w-full items-center gap-3 font-semibold text-red-500 px-4 py-2.5 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
                        >
                          <LogOut className="size-5" />
                          Đăng xuất
                        </button>
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                </div>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="hidden lg:flex items-center gap-x-2 rounded-[var(--rounded)] border border-sky-500 px-4 py-2.5 text-sm font-semibold text-sky-500 hover:bg-[var(--hover)] hover:border-transparent hover:text-white transition-all cursor-pointer"
                >
                  <User className="size-4" />
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* ===== TẦNG DƯỚI NAVBAR ===== */}
        <nav className="hidden lg:block border-t">
          <div className="flex flex-col lg:flex-row items-center justify-between px-4 md:px-2 xl:px-0 py-4 gap-4 max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold">
              <MedServiceDropdownMenu />
              <Link
                to="/user/specialties"
                className="hover:text-[var(--hover)] flex justify-center items-center gap-1 cursor-pointer"
              >
                <Hospital className="w-5 h-5" />
                Chuyên khoa
              </Link>
              <HelpMedDropdownMenu />
              <Link
                to="/new-code"
                className="hover:text-[var(--hover)] flex justify-center items-center gap-1 cursor-pointer"
              >
                <BadgeInfo className="w-5 h-5" />
                Về FoMed
              </Link>
              <Link
                to="/free-code"
                className="hover:text-[var(--hover)] flex justify-center items-center gap-1 cursor-pointer"
              >
                <PhoneIcon className="w-5 h-5" />
                Liên hệ
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={handleBookingClick}
                className="bg-primary-linear text-white px-4 py-2 rounded-[var(--rounded)] shadow-sm flex items-center gap-2 text-sm font-bold transition duration-200 active:scale-95 cursor-pointer hover:opacity-90"
              >
                <ClipboardClock className="size-5" /> Đặt lịch
              </button>
              <Link
                to="/patient-portal-login"
                className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-[var(--rounded)] shadow-sm flex items-center gap-2 text-sm font-bold transition duration-200 active:scale-95 cursor-pointer"
              >
                <ScanHeart className="size-5" /> Tra cứu kết quả
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Modal đăng nhập */}
      <AuthModal
        isOpen={isLoginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
