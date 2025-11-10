import {
  TrendingUp,
  TrendingDown,
  Activity,
  Stethoscope,
  CalendarPlus,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getVisitTotals,
  getDoctorTotals,
  getPatientTotals,
  getMonthlySales,
  getMonthlyTarget, // <-- dùng API target
  type VisitTotalResponse,
  type DoctorTotalResponse,
  type PatientTotalResponse,
  type MonthlySalesResponse,
  type MonthlyTargetResponse, // <-- type target
} from "../../../services/dashboard";
import toast from "react-hot-toast";

/* ===== Helpers ===== */
const fmtVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);

// Tên tháng tiếng Việt
const VN_MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

type StatCardProps = {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  loading?: boolean;
};

const StatCard = ({ title, value, change, icon, loading }: StatCardProps) => {
  const isPositive = change >= 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-gray-100 rounded-lg p-3 w-12 h-12"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span
              className={`text-sm font-semibold ${
                isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {Math.abs(change).toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg p-3">{icon}</div>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const [visitData, setVisitData] = useState<VisitTotalResponse | null>(null);
  const [doctorData, setDoctorData] = useState<DoctorTotalResponse | null>(
    null
  );
  const [patientData, setPatientData] = useState<PatientTotalResponse | null>(
    null
  );
  const [salesData, setSalesData] = useState<MonthlySalesResponse | null>(null);
  const [targetData, setTargetData] = useState<MonthlyTargetResponse | null>(
    null
  ); // <-- state target
  const [loading, setLoading] = useState(true);

  // Tooltip cho chart
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const year = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [visits, doctors, patients, sales, target] = await Promise.all([
          getVisitTotals(),
          getDoctorTotals(),
          getPatientTotals(),
          getMonthlySales({ year }),
          getMonthlyTarget({ year }), // <-- gọi API Monthly Target (mặc định tháng hiện tại)
        ]);

        setVisitData(visits);
        setDoctorData(doctors);
        setPatientData(patients);
        setSalesData(sales);
        setTargetData(target); // <-- set target
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [year]);

  /* ====== Tính toán phụ ====== */
  const calculateVisitChange = (): number => {
    if (!visitData) return 0;
    const { totalThisWeek, totalThisMonth } = visitData;
    if (totalThisWeek === 0) return totalThisMonth > 0 ? 100 : 0;
    return ((totalThisMonth - totalThisWeek) / totalThisWeek) * 100;
  };

  const calculateDoctorActivePercentage = (): number => {
    if (!doctorData) return 0;
    const { totalActive, totalAll } = doctorData;
    if (totalAll === 0) return 0;
    return (totalActive / totalAll) * 100;
  };

  const calculatePatientChange = (): number => {
    if (!patientData) return 0;
    const { newThisWeek, newThisMonth } = patientData;
    if (newThisWeek === 0) return newThisMonth > 0 ? 100 : 0;
    return ((newThisMonth - newThisWeek) / newThisWeek) * 100;
  };

  // Dữ liệu cột: ép nhãn tháng về tiếng Việt theo month (1..12)
  const bars = (salesData?.monthly ?? []).map((b) => ({
    ...b,
    monthName: VN_MONTHS[(b.month ?? 1) - 1] ?? b.monthName,
  }));
  const maxValue = bars.length ? Math.max(...bars.map((b) => b.revenue)) : 0;

  // Lấy dữ liệu mục tiêu từ API (fallback an toàn)
  const monthRevenue = targetData?.actualRevenue ?? 0;
  const monthlyTarget = targetData?.targetRevenue ?? 100_000_000;
  const targetPercentage =
    targetData?.progressPercent ??
    (monthlyTarget > 0
      ? Math.min(100, Math.round((monthRevenue / monthlyTarget) * 10000) / 100)
      : 0);

  // ==== Monthly Target deltas & trends ====
  const revenueChangePct = salesData?.monthOverMonthChange ?? 0; // MoM từ API /monthly-sales

  // So sánh doanh thu tháng với mục tiêu tháng
  const targetGapPct =
    monthlyTarget > 0
      ? ((monthRevenue - monthlyTarget) / monthlyTarget) * 100
      : 0;

  // So sánh tiến độ theo ngày: đã đi được bao nhiêu % so với mục tiêu lũy kế tới hôm nay
  const now = new Date();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const dayIndex = now.getDate();
  const expectedSoFar = (monthlyTarget / daysInMonth) * dayIndex;
  const todayDeltaPct =
    expectedSoFar > 0
      ? ((monthRevenue - expectedSoFar) / expectedSoFar) * 100
      : 0;

  // Giá trị “Today” (ước lượng trung bình ngày hiện tại)
  const todayAmount = dayIndex > 0 ? monthRevenue / dayIndex : 0;

  // Helper hiển thị % có +/-
  const signedPct = (v: number) =>
    `${v >= 0 ? "+" : ""}${Math.abs(v).toFixed(0)}%`;

  // Helper chọn màu & icon
  const trendCls = (v: number) => (v >= 0 ? "text-green-500" : "text-red-500");
  const TrendIcon = ({ v }: { v: number }) =>
    v >= 0 ? (
      <TrendingUp className="w-3 h-3 text-green-500" />
    ) : (
      <TrendingDown className="w-3 h-3 text-red-500" />
    );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thống kê hoạt động</h1>
        <p className="text-sm text-gray-600 mt-1">
          Tổng quan về hoạt động phòng khám
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Lượt khám tháng này"
          value={visitData?.totalThisMonth.toLocaleString() || "0"}
          change={calculateVisitChange()}
          icon={<CalendarPlus className="w-6 h-6 text-sky-600" />}
          loading={loading}
        />
        <StatCard
          title="Bác sĩ hoạt động"
          value={`${doctorData?.totalActive ?? 0}/${doctorData?.totalAll ?? 0}`}
          change={calculateDoctorActivePercentage()}
          icon={<Stethoscope className="w-6 h-6 text-green-600" />}
          loading={loading}
        />
        <StatCard
          title="Bệnh nhân mới tháng này"
          value={patientData?.newThisMonth.toLocaleString() || "0"}
          change={calculatePatientChange()}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          loading={loading}
        />
        {/* Doanh thu tháng này (từ API monthly-sales) */}
        <StatCard
          title={`Doanh thu tháng này (${
            salesData?.year ?? new Date().getFullYear()
          })`}
          value={fmtVND(salesData?.currentMonthRevenue ?? 0)}
          change={salesData?.monthOverMonthChange ?? 0}
          icon={<Activity className="w-6 h-6 text-yellow-500" />}
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Doanh thu theo tháng {salesData ? `(${salesData.year})` : ""}
            </h2>
            <button
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
              title="Tùy chọn"
              aria-label="Tùy chọn"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01"
                />
              </svg>
            </button>
          </div>

          {/* Chart container cần relative để đặt tooltip */}
          <div className="relative" ref={chartRef}>
            {/* Bars */}
            <div className="h-80 flex items-end justify-between gap-4 px-4">
              {(bars.length
                ? bars
                : Array.from({ length: 12 }, (_, i) => ({
                    monthName: VN_MONTHS[i],
                    revenue: 0,
                  }))
              ).map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full flex items-end justify-center"
                    style={{ height: "320px" }}
                  >
                    <div
                      className="w-6 bg-blue-500 rounded-t-lg hover:bg-blue-600 transition-all cursor-pointer"
                      style={{
                        height:
                          maxValue > 0
                            ? `${(data.revenue / maxValue) * 100}%`
                            : "0%",
                      }}
                      onMouseEnter={(e) => {
                        const bar = e.currentTarget as HTMLDivElement;
                        const container = chartRef.current;
                        if (!container) return;
                        const barRect = bar.getBoundingClientRect();
                        const contRect = container.getBoundingClientRect();
                        // clamp x để tooltip không tràn khỏi container
                        let x =
                          barRect.left + barRect.width / 2 - contRect.left;
                        x = Math.max(8, Math.min(x, contRect.width - 8));
                        setTooltip({
                          x,
                          y: barRect.top - contRect.top - 8,
                          text: `Doanh thu: ${fmtVND(
                            Math.round(data.revenue ?? 0)
                          )}`,
                        });
                      }}
                      onMouseMove={(e) => {
                        const bar = e.currentTarget as HTMLDivElement;
                        const container = chartRef.current;
                        if (!container) return;
                        const barRect = bar.getBoundingClientRect();
                        const contRect = container.getBoundingClientRect();
                        let x =
                          barRect.left + barRect.width / 2 - contRect.left;
                        x = Math.max(8, Math.min(x, contRect.width - 8));
                        setTooltip({
                          x,
                          y: barRect.top - contRect.top - 8,
                          text: `${fmtVND(
                            Math.round(data.revenue ?? 0)
                          )}`,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{data.monthName}</p>
                </div>
              ))}
            </div>

            {/* Tooltip: canh giữa tâm cột, nằm trên đầu cột */}
            {tooltip && (
              <div
                className="absolute z-10 pointer-events-none bg-white border border-gray-200 shadow-sm rounded px-2 py-2 font-semibold text-blue-500"
                style={{
                  left: tooltip.x,
                  top: tooltip.y,
                  transform: "translate(-50%, -100%)",
                }}
              >
                {tooltip.text}
              </div>
            )}
          </div>

          {/* Tổng kết */}
          {salesData && (
            <div className="mt-4 text-sm text-gray-600">
              <div>
                Tổng doanh thu năm:{" "}
                <b className="text-green-500">
                  {fmtVND(salesData.totalRevenue)}
                </b>
              </div>
              <div>
                Doanh thu trung bình tháng:{" "}
                <b className="text-red-500">
                  {fmtVND(salesData.avgMonthlyRevenue)}
                </b>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Target (từ API) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Mục tiêu tháng này</h2>
            <button
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
              title="Tùy chọn"
              aria-label="Tùy chọn"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01"
                />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-6">
            Mục tiêu doanh thu cho mỗi tháng
          </p>

          {/* Doughnut tiến độ */}
          <div className="relative h-48 mb-6 flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#e5e7eb"
                strokeWidth="16"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#3b82f6"
                strokeWidth="16"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${
                  2 * Math.PI * 70 * (1 - targetPercentage / 100)
                }`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-gray-900">
                {targetPercentage}%
              </p>
              <p className="text-xs text-gray-500">hoàn thành</p>
            </div>
          </div>

          <p className="text-sm text-center text-gray-600 mb-6">
            Doanh thu tháng này{" "}
            <b className="text-green-500">{fmtVND(monthRevenue)}</b>
          </p>

          {/* Stats Footer */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            {/* Target */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Mục tiêu</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-sm font-bold">{fmtVND(monthlyTarget)}</p>
                <TrendIcon v={targetGapPct} />
                <span
                  className={`text-xs font-semibold ${trendCls(targetGapPct)}`}
                >
                  {signedPct(targetGapPct)}
                </span>
              </div>
            </div>

            {/* Revenue (MoM) */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Tháng này</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-sm font-bold">{fmtVND(monthRevenue)}</p>
                <TrendIcon v={revenueChangePct} />
                <span
                  className={`text-xs font-semibold ${trendCls(
                    revenueChangePct
                  )}`}
                >
                  {signedPct(revenueChangePct)}
                </span>
              </div>
            </div>

            {/* Today (progress vs expected so far) */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Hôm nay</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-sm font-bold">{fmtVND(todayAmount)}</p>
                <TrendIcon v={todayDeltaPct} />
                <span
                  className={`text-xs font-semibold ${trendCls(todayDeltaPct)}`}
                >
                  {signedPct(todayDeltaPct)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
