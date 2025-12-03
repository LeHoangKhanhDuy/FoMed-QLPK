import {
  LayoutDashboard,
  Stethoscope,
  ClipboardList,
  Users,
  CalendarDays,
  UserIcon,
  Pill,
  Wallet2,
  BookUser,
  ClipboardPlus,
  ShieldPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { appointmentsList } from "../../../services/appointmentsApi";
import { apiCompletedVisitsPendingBilling } from "../../../services/billingApi";
import toast from "react-hot-toast";

type Item = {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string | number;
  category?: string; // Phân loại menu
  roles?: string[]; // Roles được phép truy cập
  readOnly?: string[]; // Roles chỉ được xem, không sửa
  disabled?: boolean; // Menu bị vô hiệu hóa
};

export default function CMSSidebar() {
  const { pathname } = useLocation();
  const [todayCount, setTodayCount] = useState<number>(0);
  const [pendingBillingCount, setPendingBillingCount] = useState<number>(0);
  
  // Lấy thông tin user từ localStorage
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userRoles: string[] = userInfo.roles || [];
  
  // Gọi API khi sidebar mount để đếm số lịch hôm nay
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    appointmentsList({ date: today, page: 1, limit: 200 })
      .then((res) => {
        const waiting = res.items?.filter(
          (x) => x.status === "waiting" || x.status === "booked"
        ).length;
        setTodayCount(waiting ?? 0);
      })
      .catch(() => toast.error("Không tải được số lượng lịch hôm nay"));
  }, []);

  // Gọi API khi sidebar mount để đếm số hóa đơn chờ thanh toán (chỉ ADMIN)
  useEffect(() => {
    if (userRoles.includes("ADMIN")) {
      apiCompletedVisitsPendingBilling()
        .then((res) => {
          setPendingBillingCount(res.length ?? 0);
        })
        .catch(() => toast.error("Không tải được số lượng hóa đơn chờ thanh toán"));
    }
  }, [userRoles]);

  const items: Item[] = [
    // === THỐNG KÊ - TẤT CẢ ĐỀU THẤY ===
    { 
      name: "Dashboard", 
      href: "/cms/dashboard", 
      icon: LayoutDashboard,
      category: "Thống kê",
      roles: ["ADMIN", "DOCTOR", "EMPLOYEE"],
    },
    
    // === LỊCH KHÁM - EMPLOYEE VÀ ADMIN ===
    {
      name: "Tạo lịch khám",
      href: "/cms/create-appointments",
      icon: CalendarDays,
      category: "Lịch khám bệnh",
      roles: ["ADMIN", "EMPLOYEE"],
    },
    {
      name: "Chờ khám",
      href: "/cms/patient-list-today",
      icon: Users,
      badge: todayCount > 0 ? todayCount : undefined,
      category: "Lịch khám bệnh",
      roles: ["ADMIN", "DOCTOR", "EMPLOYEE"],
    },
    
    // === LỊCH LÀM VIỆC - DOCTOR XEM, EMPLOYEE VÀ ADMIN SỬA ===
    { 
      name: "Lịch làm việc", 
      href: "/cms/doctor-schedule", 
      icon: Stethoscope,
      category: "Lịch làm việc",
      roles: ["ADMIN", "DOCTOR", "EMPLOYEE"],
      readOnly: ["DOCTOR"], // DOCTOR chỉ xem, không sửa
    },
    
    // === QUẢN LÝ - CHỈ ADMIN ===
    { 
      name: "Hóa đơn", 
      href: "/cms/billing", 
      icon: Wallet2,
      badge: pendingBillingCount > 0 ? pendingBillingCount : undefined,
      category: "Quản lý hệ thống",
      roles: ["ADMIN"],
    },
    { 
      name: "Bác sĩ", 
      href: "/cms/doctor-manager", 
      icon: ClipboardPlus,
      category: "Quản lý hệ thống",
      roles: ["ADMIN"],
    },
    { 
      name: "Chuyên khoa", 
      href: "/cms/specialty-manager", 
      icon: ShieldPlus,
      category: "Quản lý hệ thống",
      roles: ["ADMIN"],
    },
    { 
      name: "Bệnh nhân", 
      href: "/cms/patient-manager", 
      icon: BookUser,
      category: "Quản lý hệ thống",
      roles: ["ADMIN"],
    },
    { 
      name: "Người dùng", 
      href: "/cms/users-manager", 
      icon: UserIcon,
      category: "Quản lý hệ thống",
      roles: ["ADMIN"],
    },
    {
      name: "Dịch vụ",
      href: "/cms/service-manager",
      icon: ClipboardList,
      category: "Quản lý hệ thống",
      roles: ["ADMIN"],
    },
    { 
      name: "Thuốc", 
      href: "/cms/drug-manager", 
      icon: Pill,
      category: "Quản lý hệ thống",
      roles: ["ADMIN"],
    },
  ];
  
  // Kiểm tra user có quyền truy cập menu không
  const hasAccess = (item: Item): boolean => {
    if (!item.roles) return true; // Không giới hạn roles
    return item.roles.some(role => userRoles.includes(role));
  };

  // Gom các menu theo category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || "Khác";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  return (
    <aside
      className={[
        "h-[calc(100dvh-56px)] sm:h-screen sm:top-0 sm:fixed bg-white border-r shadow-sm",
        "w-72 sm:w-64 sm:left-0 sm:pt-16 sm:pb-4 overflow-y-auto",
      ].join(" ")}
    >
      <nav className="px-3 py-4 space-y-4">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category}>
            {/* Category header */}
            <div className="px-3 mb-2">
              <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                {category}
              </h3>
            </div>
            
            {/* Category items */}
            <div className="space-y-1">
              {categoryItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== "/cms" && pathname.startsWith(item.href));
                const canAccess = hasAccess(item);
                const isDisabled = !canAccess;
                
                // Nếu không có quyền, hiển thị mờ và không thể click
                if (isDisabled) {
                  return (
                    <div
                      key={item.href}
                      className={[
                        "group flex items-center gap-3 px-3 py-2 rounded-xl",
                        "opacity-40 cursor-not-allowed",
                        "text-gray-400",
                      ].join(" ")}
                      title="Bạn không có quyền truy cập"
                    >
                      <span className="inline-flex items-center justify-center rounded-lg bg-gray-100 p-2">
                        <Icon className="w-5 h-5 text-gray-400" />
                      </span>
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-400">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  );
                }
                
                // Có quyền truy cập
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={[
                      "group flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer",
                      active
                        ? "bg-sky-100 text-sky-500 font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                    ].join(" ")}
                  >
                    <span className="inline-flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-white p-2">
                      <Icon
                        className={[
                          "w-5 h-5",
                          active ? "text-sky-500" : "text-gray-500",
                        ].join(" ")}
                      />
                    </span>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
