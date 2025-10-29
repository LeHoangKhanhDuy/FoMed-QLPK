import { TrendingUp, TrendingDown, Activity, Stethoscope, CalendarPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getVisitTotals, getDoctorTotals, getPatientTotals, type VisitTotalResponse, type DoctorTotalResponse, type PatientTotalResponse } from "../../../services/dashboard";
import toast from "react-hot-toast";

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
  const [doctorData, setDoctorData] = useState<DoctorTotalResponse | null>(null);
  const [patientData, setPatientData] = useState<PatientTotalResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Gọi cả 3 API song song
        const [visits, doctors, patients] = await Promise.all([
          getVisitTotals(),
          getDoctorTotals(),
          getPatientTotals()
        ]);
        
        setVisitData(visits);
        setDoctorData(doctors);
        setPatientData(patients);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Tính % thay đổi lượt khám (so sánh thisMonth vs thisWeek)
  const calculateVisitChange = (): number => {
    if (!visitData) return 0;
    const { totalThisWeek, totalThisMonth } = visitData;
    if (totalThisWeek === 0) return totalThisMonth > 0 ? 100 : 0;
    return ((totalThisMonth - totalThisWeek) / totalThisWeek) * 100;
  };

  // Tính % bác sĩ hoạt động so với tổng số
  const calculateDoctorActivePercentage = (): number => {
    if (!doctorData) return 0;
    const { totalActive, totalAll } = doctorData;
    if (totalAll === 0) return 0;
    // % bác sĩ đang hoạt động
    return (totalActive / totalAll) * 100;
  };

  // Tính % thay đổi bệnh nhân mới (so sánh thisMonth vs thisWeek)
  const calculatePatientChange = (): number => {
    if (!patientData) return 0;
    const { newThisWeek, newThisMonth } = patientData;
    if (newThisWeek === 0) return newThisMonth > 0 ? 100 : 0;
    return ((newThisMonth - newThisWeek) / newThisWeek) * 100;
  };
  const monthlyData = [
    { month: "Jan", value: 150 },
    { month: "Feb", value: 380 },
    { month: "Mar", value: 200 },
    { month: "Apr", value: 300 },
    { month: "May", value: 180 },
    { month: "Jun", value: 190 },
    { month: "Jul", value: 290 },
    { month: "Aug", value: 90 },
    { month: "Sep", value: 200 },
    { month: "Oct", value: 400 },
    { month: "Nov", value: 270 },
    { month: "Dec", value: 100 },
  ];

  const maxValue = 400;
  const targetPercentage = 75.55;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
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
          value={`${doctorData?.totalActive || 0}/${doctorData?.totalAll || 0}`}
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
        <StatCard
          title="Growth"
          value="45%"
          change={5.2}
          icon={<Activity className="w-6 h-6 text-gray-600" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Monthly Sales</h2>
            <button className="text-gray-400 hover:text-gray-600">
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
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>
          
          {/* Custom Bar Chart */}
          <div className="h-80 flex items-end justify-between gap-4 px-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="w-full flex items-end justify-center" style={{ height: '320px' }}>
                  <div
                    className="w-6 bg-blue-500 rounded-t-lg hover:bg-blue-600 transition-all cursor-pointer"
                    style={{
                      height: `${(data.value / maxValue) * 100}%`,
                    }}
                    title={`${data.month}: ${data.value}`}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">{data.month}</p>
              </div>
            ))}
          </div>
          
          {/* Y-axis labels */}
          <div className="flex justify-between text-xs text-gray-400 mt-2 px-4">
            <span>0</span>
            <span>100</span>
            <span>200</span>
            <span>300</span>
            <span>400</span>
          </div>
        </div>

        {/* Monthly Target */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Monthly Target</h2>
            <button className="text-gray-400 hover:text-gray-600">
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
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-6">
            Target you've set for each month
          </p>

          {/* Custom Doughnut Chart */}
          <div className="relative h-48 mb-6 flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#e5e7eb"
                strokeWidth="16"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#3b82f6"
                strokeWidth="16"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - targetPercentage / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-gray-900">
                {targetPercentage}%
              </p>
              <p className="text-xs text-green-500 font-semibold">+10%</p>
            </div>
          </div>

          <p className="text-xs text-center text-gray-600 mb-6">
            You earn $3287 today, it's higher than last month.
            <br />
            Keep up your good work!
          </p>

          {/* Stats Footer */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Target</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-sm font-bold text-gray-900">$20K</p>
                <TrendingDown className="w-3 h-3 text-red-500" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Revenue</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-sm font-bold text-gray-900">$20K</p>
                <TrendingUp className="w-3 h-3 text-green-500" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Today</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-sm font-bold text-gray-900">$20K</p>
                <TrendingUp className="w-3 h-3 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
