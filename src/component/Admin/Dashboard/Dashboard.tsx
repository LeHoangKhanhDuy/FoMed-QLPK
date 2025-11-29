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
  getMonthlyTarget,
  type VisitTotalResponse,
  type DoctorTotalResponse,
  type PatientTotalResponse,
  type MonthlySalesResponse,
  type MonthlyTargetResponse,
} from "../../../services/dashboard";
import toast from "react-hot-toast";

/* ================= CONSTANTS & HELPERS ================= */

// Mốc mục tiêu cố định cho biểu đồ (100 triệu)
const TARGET_REVENUE_CHART_BASELINE = 100_000_000;

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

// Format tiền tệ đầy đủ: 100.000.000 ₫
const fmtVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);

// Format số ngắn gọn cho trục Y: 100tr, 1 tỷ
const formatCompactNumber = (val: number) => {
  if (val >= 1_000_000_000)
    return `${(val / 1_000_000_000).toFixed(1).replace(/\.0$/, "")} tỷ`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)}tr`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
  return val.toString();
};

/* ================= COMPONENTS ================= */

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
          <div className="flex-1 space-y-2">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-8 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
          <div className="bg-gray-100 rounded-lg p-3 w-12 h-12" />
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
              {Math.abs(change).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg p-3">{icon}</div>
      </div>
    </div>
  );
};

const TrendIcon = ({ v }: { v: number }) =>
  v >= 0 ? (
    <TrendingUp className="w-3 h-3 text-green-500" />
  ) : (
    <TrendingDown className="w-3 h-3 text-red-500" />
  );

/* ================= MAIN DASHBOARD ================= */

export const Dashboard = () => {
  // State
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
  );
  const [loading, setLoading] = useState(true);

  // Tooltip State
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const year = useMemo(() => new Date().getFullYear(), []);

  // Fetch Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [visits, doctors, patients, sales, target] = await Promise.all([
          getVisitTotals(),
          getDoctorTotals(),
          getPatientTotals(),
          getMonthlySales({ year }),
          getMonthlyTarget({ year }),
        ]);

        setVisitData(visits);
        setDoctorData(doctors);
        setPatientData(patients);
        setSalesData(sales);
        setTargetData(target);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [year]);

  // --- Logic tính toán ---

  // 1. Stats Change Percentages
  const calcChange = (current: number, total: number) => {
    if (current === 0) return total > 0 ? 100 : 0;
    return ((total - current) / current) * 100;
  };

  const visitChange = visitData
    ? calcChange(visitData.totalThisWeek, visitData.totalThisMonth)
    : 0;

  const doctorActivePct =
    doctorData && doctorData.totalAll > 0
      ? (doctorData.totalActive / doctorData.totalAll) * 100
      : 0;

  const patientChange = patientData
    ? calcChange(patientData.newThisWeek, patientData.newThisMonth)
    : 0;

  // 2. Chart Logic (Quan trọng)
  const bars = (salesData?.monthly ?? []).map((b) => ({
    ...b,
    monthName: VN_MONTHS[(b.month ?? 1) - 1] ?? b.monthName,
  }));

  // Tìm doanh thu lớn nhất thực tế
  const actualMaxRevenue =
    bars.length > 0 ? Math.max(...bars.map((b) => b.revenue)) : 0;

  // MaxValue của biểu đồ:
  // - Ít nhất là 100tr (TARGET_REVENUE_CHART_BASELINE).
  // - Nếu doanh thu thực tế > 100tr thì lấy doanh thu thực tế * 1.1 (để cột không chạm nóc).
  const chartMaxValue = Math.max(
    TARGET_REVENUE_CHART_BASELINE,
    actualMaxRevenue * 1.1
  );

  // Tạo 5 mốc trên trục Y
  const yAxisTicks = Array.from(
    { length: 5 },
    (_, i) => (chartMaxValue / 5) * (i + 1)
  );

  // Vị trí % của đường Target line (nếu target < max)
  const targetLinePercent =
    (TARGET_REVENUE_CHART_BASELINE / chartMaxValue) * 100;

  // 3. Target Doughnut Logic
  const monthRevenue = targetData?.actualRevenue ?? 0;
  const monthlyTarget =
    targetData?.targetRevenue ?? TARGET_REVENUE_CHART_BASELINE;

  const targetPercentage =
    targetData?.progressPercent ??
    (monthlyTarget > 0
      ? Math.min(100, Math.round((monthRevenue / monthlyTarget) * 10000) / 100)
      : 0);

  const revenueChangePct = salesData?.monthOverMonthChange ?? 0;

  const targetGapPct =
    monthlyTarget > 0
      ? ((monthRevenue - monthlyTarget) / monthlyTarget) * 100
      : 0;

  // Tính tiến độ ngày hiện tại
  const now = new Date();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const todayExpected = (monthlyTarget / daysInMonth) * now.getDate();
  const todayDeltaPct =
    todayExpected > 0
      ? ((monthRevenue - todayExpected) / todayExpected) * 100
      : 0;
  const todayAvg = now.getDate() > 0 ? monthRevenue / now.getDate() : 0;

  // --- Helpers UI ---
  const signedPct = (v: number) =>
    `${v >= 0 ? "+" : ""}${Math.abs(v).toFixed(0)}%`;
  const trendCls = (v: number) => (v >= 0 ? "text-green-500" : "text-red-500");

  return (
    <div className="space-y-6">
      {/* Header */}
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
          change={visitChange}
          icon={<CalendarPlus className="w-6 h-6 text-sky-600" />}
          loading={loading}
        />
        <StatCard
          title="Bác sĩ hoạt động"
          value={`${doctorData?.totalActive ?? 0}/${doctorData?.totalAll ?? 0}`}
          change={doctorActivePct} // Hiển thị % active thay vì change
          icon={<Stethoscope className="w-6 h-6 text-green-600" />}
          loading={loading}
        />
        <StatCard
          title="Bệnh nhân mới"
          value={patientData?.newThisMonth.toLocaleString() || "0"}
          change={patientChange}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          loading={loading}
        />
        <StatCard
          title={`Doanh thu (${salesData?.year ?? year})`}
          value={fmtVND(salesData?.currentMonthRevenue ?? 0)}
          change={salesData?.monthOverMonthChange ?? 0}
          icon={<Activity className="w-6 h-6 text-yellow-500" />}
          loading={loading}
        />
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Doanh thu theo tháng {salesData ? `(${salesData.year})` : ""}
            </h2>
          </div>

          <div className="relative" ref={chartRef}>
            <div className="flex gap-3">
              {/* Trục Y */}
              <div className="flex flex-col justify-between text-xs text-gray-500 pt-2 pb-8 h-64 sm:h-80 md:h-96">
                {[...yAxisTicks].reverse().map((mark) => (
                  <div
                    key={mark}
                    className="text-right whitespace-nowrap min-w-[30px]"
                  >
                    {formatCompactNumber(mark)}
                  </div>
                ))}
              </div>

              {/* Chart Area */}
              <div className="relative flex-1 h-64 sm:h-80 md:h-96 border-b border-gray-100 flex items-end justify-between gap-1 sm:gap-2">
                {/* Đường kẻ Mốc Target 100tr */}
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-red-300 z-0 pointer-events-none"
                  style={{ bottom: `${targetLinePercent}%` }}
                >
                  <span className="absolute right-0 -top-3 text-[10px] font-medium text-red-500 bg-white px-1 shadow-sm rounded">
                    Mục tiêu:{" "}
                    {formatCompactNumber(TARGET_REVENUE_CHART_BASELINE)}
                  </span>
                </div>

                {/* Các cột (Bars) */}
                {(bars.length
                  ? bars
                  : Array.from({ length: 12 }, (_, i) => ({
                      monthName: VN_MONTHS[i],
                      revenue: 0,
                    }))
                ).map((data, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1 min-w-[24px] z-10 h-full justify-end group"
                  >
                    <div className="w-full flex items-end justify-center h-full relative">
                      <div
                        className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all duration-300 cursor-pointer"
                        style={{
                          height: `${(data.revenue / chartMaxValue) * 100}%`,
                          minHeight: data.revenue > 0 ? "4px" : "0px",
                        }}
                        onMouseEnter={(e) => {
                          const bar = e.currentTarget;
                          const container = chartRef.current;
                          if (!container) return;
                          const barRect = bar.getBoundingClientRect();
                          const contRect = container.getBoundingClientRect();
                          let x =
                            barRect.left + barRect.width / 2 - contRect.left;
                          x = Math.max(40, Math.min(x, contRect.width - 40)); // clamp
                          setTooltip({
                            x,
                            y: barRect.top - contRect.top - 10,
                            text: fmtVND(data.revenue),
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-2 truncate w-full text-center">
                      {data.monthName.replace("Tháng ", "T")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tooltip */}
            {tooltip && (
              <div
                className="absolute z-50 pointer-events-none bg-slate-800 text-white text-xs rounded py-1 px-2 shadow-lg transform -translate-x-1/2 -translate-y-full transition-all duration-75"
                style={{ left: tooltip.x, top: tooltip.y }}
              >
                {tooltip.text}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 border-4 border-transparent border-t-slate-800" />
              </div>
            )}
          </div>

          {/* Footer Summary */}
          {salesData && (
            <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Tổng doanh thu năm:</span>
                <p className="text-lg font-bold text-green-600">
                  {fmtVND(salesData.totalRevenue)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Trung bình tháng:</span>
                <p className="text-lg font-bold text-blue-600">
                  {fmtVND(salesData.avgMonthlyRevenue)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* TARGET & PROGRESS SECTION */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Mục tiêu tháng</h2>
          </div>

          {/* Doughnut Chart */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
            <div className="relative w-48 h-48">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 160 160"
              >
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#f3f4f6"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 70 * (1 - targetPercentage / 100)
                  }`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">
                  {targetPercentage}%
                </span>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Hoàn thành
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">Doanh thu hiện tại</p>
              <p className="text-2xl font-bold text-gray-900">
                {fmtVND(monthRevenue)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                / Mục tiêu {formatCompactNumber(monthlyTarget)}
              </p>
            </div>
          </div>

          {/* Mini Stats Footer */}
          <div className="mt-6 grid grid-cols-3 gap-2 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase">Mục tiêu</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendIcon v={targetGapPct} />
                <span className={`text-xs font-bold ${trendCls(targetGapPct)}`}>
                  {signedPct(targetGapPct)}
                </span>
              </div>
            </div>
            <div className="text-center border-l border-gray-100">
              <p className="text-[10px] text-gray-500 uppercase">
                So tháng trước
              </p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendIcon v={revenueChangePct} />
                <span
                  className={`text-xs font-bold ${trendCls(revenueChangePct)}`}
                >
                  {signedPct(revenueChangePct)}
                </span>
              </div>
            </div>
            <div className="text-center border-l border-gray-100">
              <p className="text-[10px] text-gray-500 uppercase">Hôm nay</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendIcon v={todayDeltaPct} />
                <span
                  className={`text-xs font-bold ${trendCls(todayDeltaPct)}`}
                >
                  {fmtVND(todayAvg)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
