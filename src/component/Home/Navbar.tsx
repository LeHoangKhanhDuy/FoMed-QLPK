import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  PopoverGroup,
} from "@headlessui/react";
import {
  AlignJustify,
  BadgePercent,
  CircleUserRound,
  CreditCardIcon,
  Heart,
  LogOut,
  LucideLightbulb,
  MousePointerSquareDashed,
  PhoneIcon,
  Settings,
  ShoppingBagIcon,
  Star,
  Upload,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
              <img
                src="/assets/FoCode Logo.png"
                alt="Logo"
                className="h-10 w-auto max-[320px]:max-w-[80px]"
              />
            </Link>

            {/* MẠNG XÃ HỘI */}
            <div className="hidden lg:flex items-center px-6 space-x-6">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.facebook.com/profile.php?id=61577300429551"
                className="flex items-center space-x-2 cursor-pointer"
              >
                <img
                  src="/assets/facebookLogo.png"
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
                  src="/assets/gmaillogo.png"
                  alt="logoGmail"
                  className="w-5 h-5"
                />
                <span className="text-black font-bold hover:text-[var(--hover)]">
                  Gmail
                </span>
              </a>
              <a
                href="https://page.fotech.pro/"
                target="blank"
                className="flex items-center space-x-2 cursor-pointer"
              >
                <img
                  src="/assets/web.png"
                  alt="logoFoTech"
                  className="w-5 h-5 rounded-full"
                />
                <span className="text-black font-bold hover:text-[var(--hover)]">
                  Website
                </span>
              </a>
            </div>

            {/* SEARCHBAR MOBILE */}
            {/* <div className="block lg:hidden max-[321px]:hidden">
              <Searchbar />
            </div> */}

            {/* MOBILE MENU MOBILE */}
            <div className="block lg:hidden relative">
              <Menu>
                <button
                  //onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 ml-auto rounded-md focus:outline-none hover:bg-gray-100"
                  aria-label="Mở menu"
                >
                  <AlignJustify />
                </button>

                {/* Backdrop mờ khi mở menu */}
                {/* {isMobileMenuOpen && (
                  <div
                    className="fixed inset-0 z-40 backdrop-brightness-50 bg-opacity-50 transition-opacity duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-hidden="true"
                  />
                )} */}

                {/* Slide menu */}
              </Menu>
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
              {/* GIỎ HÀNG DESKTOP */}
              <button
                // onClick={() => {
                //   if (cartCount === 0) {
                //     navigate("/cart-empty");
                //   } else {
                //     navigate("/shopping-cart");
                //   }
                // }}
                className="relative hidden lg:flex items-center gap-2 px-4 ml-2 py-2.5 bg-gray-200/50 rounded-full text-sm font-bold text-black hover:text-[var(--hover)] transition duration-200 cursor-pointer"
              >
                <ShoppingBagIcon className="size-5" />

                {/* {cartCount > 0 && (
                  <span className="absolute -top-1 left-10 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )} */}
              </button>
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

            <nav className="items-center gap-x-6 rounded-[var(--rounded)] hidden lg:block border hover:bg-primary group transition-all">
              <button
                //onClick={() => setLoginOpen(true)}
                className="text-sm rounded-[var(--rounded)] text-gray-700 px-4 py-2.5 cursor-pointer flex items-center gap-2 transition duration-100 group-hover:text-white"
              >
                <User className="size-4 cursor-pointer" />
                Tài khoản
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
            <PopoverGroup className="flex gap-x-6">
              {/* <CateDropdownMenu /> */}
            </PopoverGroup>
            <Link
              to="/top-code"
              className="hover:text-[var(--hover)] flex justify-center items-center gap-1"
            >
              <Star className="w-4 h-4" /> Code nổi bật
            </Link>
            <Link
              to="/new-code"
              className="hover:text-[var(--hover)] flex justify-center items-center gap-1"
            >
              <LucideLightbulb className="w-4 h-4" />
              Code mới
            </Link>
            <Link
              to="/free-code"
              className="hover:text-[var(--hover)] flex justify-center items-center gap-1"
            >
              <BadgePercent className="w-4 h-4" />
              Code miễn phí
            </Link>
            {/* <HelpDropdownMenu /> */}
            {/* <Link
              to="/"
              onClick={comingSoonFeature}
              className="hover:text-[var(--hover)] flex justify-center items-center gap-1"
            >
              <NewspaperIcon className="w-4 h-4" />
              Tin tức
            </Link> */}
            <Link
              to="/contact"
              className="hover:text-[var(--hover)] flex justify-center items-center gap-1"
            >
              <PhoneIcon className="w-4 h-4" />
              Liên hệ
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              to="/user/deposit"
              className="bg-warning-linear text-white px-4 py-2 rounded-[var(--rounded)] shadow-sm flex items-center gap-2 text-sm font-bold transition cursor-pointer"
            >
              <CreditCardIcon className="size-5" /> Nạp tiền
            </Link>

            {/* <button
                onClick={() => setLoginOpen(true)}
                className="bg-warning-linear text-white px-4 py-2 rounded-[var(--rounded)] shadow-sm flex items-center gap-2 text-sm font-bold transition cursor-pointer"
              >
                <CreditCardIcon className="size-5" /> Nạp tiền
              </button> */}

            <Link
              to="/user/add-product"
              className="bg-primary-linear text-white px-4 py-2 rounded-[var(--rounded)] shadow-sm flex items-center gap-2 text-sm font-bold transition cursor-pointer"
            >
              <Upload className="size-5" /> Tải lêndddd
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
