import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import UserLayout from "../../layouts/UserLayout";
import PrescriptionDetails from "../../component/Account/PrescriptionDetail";
import { apiGetPrescriptionDetail } from "../../services/prescriptionApi";
import type { PrescriptionDetailData } from "../../component/Account/PrescriptionDetail";

export default function UserPrescriptionDetailPage() {
  const { rxCode } = useParams<{ rxCode: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<PrescriptionDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rxCode) {
      setError("Thiếu mã đơn thuốc");
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const loadDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiGetPrescriptionDetail(rxCode, controller.signal);
        if (!isMounted) return;
        setDetail(data);
      } catch (err) {
        if (!isMounted) return;
        const message = (err as Error).message || "Không thể tải đơn thuốc";
        setError(message);
        toast.error(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDetail();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [rxCode]);

  return (
    <UserLayout>
      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-slate-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-full border border-slate-300 text-sm font-semibold text-slate-600 hover:border-sky-400 hover:text-sky-500 transition"
          >
            Quay lại
          </button>
        </div>
      ) : detail ? (
        <PrescriptionDetails
          rx={detail}
          onBack={() => navigate("/user/prescriptions")}
        />
      ) : (
        <div className="text-center text-slate-500">Không có dữ liệu</div>
      )}
    </UserLayout>
  );
}
