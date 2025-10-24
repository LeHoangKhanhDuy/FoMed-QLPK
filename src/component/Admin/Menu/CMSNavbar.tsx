import { Search, Bell, Menu, CircleUserRound, Settings, LogOut, MousePointerSquareDashed } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Menu as HeadlessMenu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import logo from "../../../assets/images/FoCode Logo.png";
import defaultAvatar from "../../../assets/images/default-avatar.png";
import toast from "react-hot-toast";

type Tab = { label: string; to: string };
type Props = {
  tabs?: Tab[];
  onToggleSidebar?: () => void; // dùng cho mobile
  onSearch?: (q: string) => void;
};

export default function CMSNavbar({ onToggleSidebar, onSearch }: Props) {
  const navigate = useNavigate();
  
  // Lấy thông tin user từ localStorage
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userName = userInfo.name || "Admin";
  const userAvatar = userInfo.avatar || defaultAvatar;
  
  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    toast.success("Đăng xuất thành công!");
    navigate("/");
  };
  
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur border-b">
      <div className="h-16 max-w-screen-2xl mx-auto flex items-center justify-between px-3 sm:px-6">
        {/* Mobile: chỉ hamburger + title ở giữa */}
        <div className="flex items-center sm:hidden w-full justify-center relative">
          <button
            onClick={onToggleSidebar}
            className="absolute left-0 p-2 rounded-lg hover:bg-gray-50 active:scale-95 transition cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <img src={logo} alt="Logo" className="h-6 w-auto" />
            <p className="font-bold text-lg text-sky-500 whitespace-nowrap">
              QUẢN LÝ FOMED
            </p>
          </Link>
        </div>

        {/* Desktop: logo + search + tabs + actions */}
        <div className="hidden sm:flex items-center gap-3 flex-1">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <img src={logo} alt="Logo" className="h-7 w-auto" />
            <p className="font-bold text-xl text-sky-500">QUẢN LÝ FOMED</p>
          </Link>

          {/* Search pill */}
          <form
            className="hidden md:flex items-center gap-2 ml-2 flex-1 max-w-md bg-gray-100 rounded-2xl px-3 h-10 focus-within:ring-2 focus-within:ring-blue-500"
            onSubmit={(e) => {
              e.preventDefault();
              const q =
                (new FormData(e.currentTarget).get("q") as string) || "";
              onSearch?.(q);
            }}
          >
            <Search className="w-4 h-4 text-gray-500" />
            <input
              name="q"
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none text-sm placeholder:text-gray-400 w-full"
            />
          </form>

          {/* Tabs + actions */}
          <nav className="ml-auto flex items-center gap-3">
            <button
              className="p-2 rounded-full hover:bg-gray-50 cursor-pointer"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* User Dropdown Menu */}
            <HeadlessMenu as="div" className="relative">
              <MenuButton className="relative flex rounded-lg text-sm cursor-pointer group outline-0">
                <span className="absolute -inset-1.5" />
                <span className="sr-only">Open user menu</span>
                <div className="flex items-center gap-x-2 rounded-lg border border-gray-300 px-3 py-2 hover:border-sky-500 transition-all">
                  <img
                    src={userAvatar}
                    alt="User Avatar"
                    className="w-6 h-6 rounded-full object-cover"
                    loading="lazy"
                  />
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-sky-500">
                    {userName}
                  </span>
                  <MousePointerSquareDashed className="w-4 h-4 text-gray-500 group-hover:text-sky-500" />
                </div>
              </MenuButton>

              <MenuItems
                transition
                anchor="bottom end"
                className="w-64 z-[100] origin-top-right rounded-xl border border-gray-200 bg-white py-2 text-sm text-gray-900 shadow-lg transition duration-300 ease-out [--anchor-gap:8px] focus:outline-none data-closed:scale-95 data-closed:opacity-0 mt-2"
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
                    <p className="text-base font-bold text-sky-500">
                      {userName}
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
                    <CircleUserRound className="size-5 text-gray-500 group-hover:text-sky-500" />
                    <span className="group-hover:text-sky-500">
                      Cài đặt tài khoản
                    </span>
                  </Link>
                </MenuItem>

                <MenuItem>
                  <Link
                    to="/user/details/change-password"
                    className="group flex w-full items-center gap-3 font-semibold px-4 py-2.5 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <Settings className="size-5 text-gray-500 group-hover:text-sky-500" />
                    <span className="group-hover:text-sky-500">
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
            </HeadlessMenu>
          </nav>
        </div>
      </div>
    </header>
  );
}
