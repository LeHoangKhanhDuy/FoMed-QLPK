import { NavLink } from "react-router-dom";
import {
  UsersRound,
  Menu,
  ChevronsLeft,
  HeartPulse,
  Pill,
  TestTubeDiagonal,
} from "lucide-react";

const menuItems = [
  {
    to: "/user/profile",
    label: "Thông tin tài khoản",
    icon: <UsersRound className="w-5 h-5" />,
  },
  {
    to: "/user/medical-history",
    label: "Lịch sử khám bệnh",
    icon: <HeartPulse className="w-5 h-5" />,
  },
  {
    to: "/user/prescriptions",
    label: "Danh sách đơn thuốc",
    icon: <Pill className="w-5 h-5" />,
  },
  {
    to: "/user/lab-result",
    label: "Kết quả xét nghiệm",
    icon: <TestTubeDiagonal className="w-5 h-5" />,
  },
  // {
  //   to: "/user/payment-history",
  //   label: "Lịch sử giao dịch",
  //   icon: <CreditCard className="w-5 h-5" />,
  // },
  // {
  //   to: "/user/withdraw",
  //   label: "Rút tiền",
  //   icon: <BanknotesIcon className="w-5 h-5" />,
  // },
  // {
  //   to: "/user/add-product",
  //   label: "Tải code lên",
  //   icon: <Upload className="w-5 h-5" />,
  // },
  // {
  //   to: "/user/product-list",
  //   label: "Code đã upload",
  //   icon: <CloudUpload className="w-5 h-5" />,
  // },
];

const Sidebar = ({
  isCollapsed,
  toggleCollapse,
}: {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}) => {
  return (
    <div
      className={`
        w-full 
        md:transition-all md:duration-300
        md:bg-white bg-white 
        p-4 rounded-lg shadow-xs ring-1 ring-slate-100
        flex flex-col
        ${isCollapsed ? "md:w-[70px]" : "md:w-1/4"}
      `}
    >
      {/* Nút toggle - nằm bên trái - cùng hàng với icon đầu tiên */}
      <button
        onClick={toggleCollapse}
        className="hidden md:inline-flex mb-4 self-start p-2 rounded hover:bg-sky-100 transition-all cursor-pointer"
      >
        {isCollapsed ? (
          <Menu className="w-5 h-5" />
        ) : (
          <ChevronsLeft className="w-5 h-5" />
        )}
      </button>

      <nav>
        <ul>
          {menuItems.map(({ to, label, icon }) => (
            <NavLink to={to} key={to}>
              {({ isActive }) => (
                <li
                  className={`mb-2 p-2 flex items-center gap-2 font-semibold cursor-pointer transition-all duration-300 ease-in-out rounded-md ${
                    isActive
                      ? "bg-sky-100 text-sky-500 border border-sky-500"
                      : "text-black hover:bg-sky-100"
                  }`}
                >
                  {icon}
                  <span
                    className={`inline md:${isCollapsed ? "hidden" : "inline"}`}
                  >
                    {label}
                  </span>
                </li>
              )}
            </NavLink>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
