import { Search, Bell, User2, Menu } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import logo from "../../../assets/images/FoCode Logo.png";

type Tab = { label: string; to: string };
type Props = {
  tabs?: Tab[];
  onToggleSidebar?: () => void; // dùng cho mobile
  onSearch?: (q: string) => void;
};

const defaultTabs: Tab[] = [
  { label: "Dashboard", to: "/csm" },
  { label: "Pages", to: "/csm/pages" },
  { label: "Posts", to: "/csm/posts" },
  { label: "Files", to: "/csm/files" },
];

export default function CMSNavbar({
  tabs = defaultTabs,
  onToggleSidebar,
  onSearch,
}: Props) {
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
          <nav className="ml-auto flex items-center gap-1">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  [
                    "px-3 py-2 rounded-lg text-sm cursor-pointer transition",
                    isActive
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-gray-900",
                  ].join(" ")
                }
              >
                {t.label}
              </NavLink>
            ))}

            <button
              className="ml-1 p-2 rounded-full hover:bg-gray-50 cursor-pointer"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button
              className="p-1.5 rounded-full bg-blue-50 hover:bg-blue-100 cursor-pointer"
              aria-label="Profile"
              title="Profile"
            >
              <User2 className="w-5 h-5 text-blue-600" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
