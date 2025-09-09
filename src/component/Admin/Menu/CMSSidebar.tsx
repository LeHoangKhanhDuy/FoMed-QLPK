import {
  LayoutDashboard,
  Stethoscope,
  Hospital,
  Building2,
  ClipboardList,
  Users,
  CalendarDays,
  CreditCard,
  Wallet,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

type Item = {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string;
};

const items: Item[] = [
  { name: "Thống kê", href: "/cms/dashboard", icon: LayoutDashboard },
  {
    name: "Tạo lịch khám",
    href: "/cms/create-appointments",
    icon: CalendarDays,
    badge: "12",
  },
  { name: "Quản lý bệnh nhân", href: "/cms/patient-list", icon: Users },
  { name: "Quản lý bác sĩ", href: "/cms/doctor-schedule", icon: Stethoscope },
  { name: "Quản lý phòng khám", href: "/csm/clinics", icon: Hospital },
  { name: "Quản lý chuyên khoa", href: "/csm/specialties", icon: Building2 },
  { name: "Quản lý dịch vụ", href: "/csm/services", icon: ClipboardList },

  { name: "Giao dịch / ví", href: "/csm/transactions", icon: CreditCard },
  {
    name: "Yêu cầu rút tiền",
    href: "/csm/withdrawals",
    icon: Wallet,
    badge: "3",
  },
];

export default function CMSSidebar() {
  const { pathname } = useLocation();

  return (
    <aside
      className={[
        "h-[calc(100dvh-56px)] sm:h-screen sm:top-0 sm:fixed bg-white border-r shadow-sm",
        "w-72 sm:w-64 sm:left-0 sm:pt-16 sm:pb-4 overflow-y-auto",
      ].join(" ")}
    >
      <nav className="px-3 py-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/csm" && pathname.startsWith(item.href));
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
      </nav>
    </aside>
  );
}
