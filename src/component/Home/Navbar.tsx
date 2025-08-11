import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  BadgeInfo,
  CircleUserRound,
  ClipboardClock,
  Heart,
  LogOut,
  MousePointerSquareDashed,
  PhoneIcon,
  Settings,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MedFacilityDropdownMenu from "./MedFacilityDropdown";
import MedServiceDropdownMenu from "./MedServiceDropdown";
import HelpMedDropdownMenu from "./HelpMedDropdown";
import phone from "../../assets/images/phone-call.png";
import fb from "../../assets/images/gmaillogo.png";
import mail from "../../assets/images/facebookLogo.png";
import zalo from "../../assets/images/logoZalo.png";

export const Navbar = () => {
  const [visible, setVisible] = useState(true);
  const [prevScroll, setPrevScroll] = useState(0);

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
    <header
      className={`bg-white lg:sticky lg:top-0 lg:left-0 lg:w-full lg:z-10 transition-transform duration-300 ${
        visible ? "lg:translate-y-0" : "lg:-translate-y-full"
      }`}
    >
      {/* TẦNG TRÊN NAVBAR */}
      <nav className="relative z-50">
        <div className=" flex flex-col lg:flex-row justify-between items-center px-4 md:px-2 xl:px-0 py-4 text-sm text-slate-700 max-w-7xl mx-auto gap-y-4 w-full overflow-visible">
          <div className="flex items-center justify-between gap-x-0 md:gap-x-6 w-full lg:w-auto">
            <Link to="/" className="flex-shrink-0">
              <h1 className="font-bold text-2xl text-sky-500">FoMed</h1>
            </Link>

            {/* HỖ TRỢ ĐẶT KHÁM */}
            <div className="hidden lg:flex items-center space-x-2 pr-6 border-r">
              <img
                src={phone}
                alt="support"
                className="w-6 h-6"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-center text-[14px] text-sky-900 font-semibold">
                  Hotline
                </span>
                <span className="text-[20px] font-bold text-[#FFA726]">
                  1800 1234
                </span>
              </div>
            </div>
            
            {/* MẠNG XÃ HỘI */}
            <div className="hidden lg:flex items-center px-2 space-x-6">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.facebook.com/profile.php?id=61577300429551"
                className="flex items-center space-x-2 cursor-pointer"
              >
                <img
                  src={fb}
                  alt="logoFacebook"
                  className="w-5 h-5"
                />
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
                <img
                  src={mail}
                  alt="logoGmail"
                  className="w-5 h-5"
                />
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
                <img
                  src={zalo}
                  alt="logoGmail"
                  className="w-5 h-5"
                />
                <span className="text-black font-bold hover:text-[var(--hover)]">
                  Zalo
                </span>
              </a>
            </div>
          </div>

          {/* DESKTOP */}
          {/* <div className="hidden lg:flex items-center space-x-6 flex-1 justify-center relative z-50">
            <div className="relative w-full max-w-lg">
              <Searchbar />
            </div>
          </div> */}

          {/* RIGHT SECTION */}
          <div className="flex flex-col sm:flex-row gap-2 items-center lg:flex-row lg:gap-x-4">
            <div className="flex items-center gap-x-3">
              {/* Avatar và menu người dùng */}
              <Menu as="div" className="relative hidden md:hidden lg:flex">
                <div>
                  <MenuButton className="relative flex rounded-[var(--rounded)] text-sm cursor-pointer group outline-0">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open menu user</span>
                    <nav className="hidden sm:flex items-center gap-x-6 rounded-[var(--rounded)] border">
                      <div className="text-sm group-hover:text-primary rounded-[var(--rounded)] text-gray-700 px-4 py-2.5 cursor-pointer flex items-center gap-2 transition duration-100">
                        {/* <User className="size-4 cursor-pointer" /> */}
                        <img
                          //   src={
                          //     user?.avatar ||
                          //     "https://cdn-icons-png.flaticon.com/512/219/219983.png"
                          //   }
                          alt="User Avatar"
                          className="w-5 h-5 rounded-full object-cover"
                          loading="lazy"
                        />
                        {/* {user.name} */}
                        <MousePointerSquareDashed className="w-4 h-4" />
                      </div>
                    </nav>
                  </MenuButton>
                </div>

                <MenuItems
                  transition
                  anchor="bottom end"
                  className="w-72 z-20 origin-top-right rounded-xl border border-gray-200 bg-white py-2 text-sm text-gray-900 shadow-md transition duration-300 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
                >
                  {/* Lời chào */}
                  <div className="flex items-center gap-3 px-4 py-2">
                    <img
                      //   src={
                      //     user?.avatar ||
                      //     "https://cdn-icons-png.flaticon.com/512/219/219983.png"
                      //   }
                      alt="User Avatar"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs text-gray-500">Xin chào,</p>
                      <p className="text-lg font-bold text-[var(--primary)] ">
                        {/* {user?.name || "Người dùng"} */}
                      </p>
                    </div>
                  </div>

                  <div className="my-1 h-px bg-gray-200" />

                  <MenuItem>
                    <Link
                      to="/user/details"
                      className="group flex w-full items-center gap-2 font-semibold px-4 py-2 hover:bg-gray-100 transition-colors duration-300"
                    >
                      <CircleUserRound className="size-6 text-gray-500 group-hover:text-[var(--hover)] transition-colors duration-300" />
                      <span className="group-hover:text-[var(--hover)] transition-colors duration-300">
                        Cài đặt tài khoản
                      </span>
                    </Link>
                  </MenuItem>

                  <MenuItem>
                    <Link
                      to="/user/favorite"
                      className="group flex w-full items-center gap-2 font-semibold px-4 py-2 hover:bg-gray-100 transition-colors duration-300"
                    >
                      <Heart className="size-6 text-gray-500 group-hover:text-[var(--hover)] transition-colors duration-300" />
                      <span className="group-hover:text-[var(--hover)] transition-colors duration-300">
                        Sản phẩm yêu thích
                      </span>
                    </Link>
                  </MenuItem>

                  <MenuItem>
                    <Link
                      to="/user/details/change-password"
                      className="group flex w-full items-center gap-2 font-semibold px-4 py-2 hover:bg-gray-100 transition-colors duration-300"
                    >
                      <Settings className="size-6 text-gray-500 group-hover:text-[var(--hover)] transition-colors duration-300" />
                      <span className="group-hover:text-[var(--hover)] transition-colors duration-300">
                        Đổi mật khẩu
                      </span>
                    </Link>
                  </MenuItem>
                  <div className="my-1 h-px bg-gray-200" />

                  <MenuItem>
                    <button
                      //onClick={handleLogout}
                      className="group flex w-full items-center gap-2 font-semibold text-red-500 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <LogOut className="size-6 text-red-500" />
                      Đăng xuất
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>

            <nav className="items-center gap-x-6 rounded-full hidden lg:block border border-sky-500 hover:border-transparent hover:bg-[var(--hover)] group transition-all">
              <button
                //onClick={() => setLoginOpen(true)}
                className="text-sm rounded-[var(--rounded)] text-sky-500 px-4 py-2.5 cursor-pointer flex items-center gap-2 transition duration-100 group-hover:text-white"
              >
                <User className="size-4 cursor-pointer" />
                Đăng nhập
              </button>
            </nav>
            {/* <AuthModal
              isOpen={isLoginOpen}
              onClose={() => setLoginOpen(false)}
            /> */}
          </div>
        </div>
      </nav>

      {/* TẦNG DƯỚI NAVBAR */}
      <nav className="hidden lg:block border-t">
        <div className="flex flex-col lg:flex-row items-center justify-between px-4 md:px-2 xl:px-0 py-4 gap-4 max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold">
            {/* MENU DROPDOWN */}
            <MedFacilityDropdownMenu />
            <MedServiceDropdownMenu />
            <HelpMedDropdownMenu />
            <Link
              to="/new-code"
              className="hover:text-[var(--hover)] flex justify-center items-center gap-1"
            >
              <BadgeInfo className="w-4 h-4" />
              Về FoMed
            </Link>
            <Link
              to="/free-code"
              className="hover:text-[var(--hover)] flex justify-center items-center gap-1"
            >
              <PhoneIcon className="w-4 h-4" />
              Liên hệ
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              to="/user/add-product"
              className="bg-primary-linear text-white px-4 py-2 rounded-[var(--rounded)] shadow-sm flex items-center gap-2 text-sm font-bold transition cursor-pointer"
            >
              <ClipboardClock className="size-5" /> Đặt lịch
            </Link>

            {/* <button
                onClick={() => setLoginOpen(true)}
                className="bg-primary-linear text-white px-4 py-2 rounded-[var(--rounded)] shadow-sm flex items-center gap-2 text-sm font-bold transition cursor-pointer"
              >
                <Upload className="size-5" /> Tải lên
              </button> */}
          </div>
        </div>
      </nav>
    </header>
  );
};
