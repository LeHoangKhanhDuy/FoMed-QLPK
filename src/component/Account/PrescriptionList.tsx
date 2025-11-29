import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import SkeletonRow from "../../Utils/SkeletonRow";
import { apiGetMyPatientId } from "../../services/patientsApi";
import {
  apiGetPrescriptions,
  type PrescriptionSummary,
} from "../../services/prescriptionApi";

const PAGE_SIZE = 20;

const formatDateOnly = (value: string | undefined) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(date.getDate())}/${pad(
    date.getMonth() + 1
  )}/${date.getFullYear()}`;
};

export default function PrescriptionList() {
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [prescriptions, setPrescriptions] = useState<PrescriptionSummary[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const parseStoredUser = () => {
    try {
      const raw = localStorage.getItem("userInfo");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const ensurePatientId = async () => {
      const stored = parseStoredUser();
      if (stored?.patientId) {
        setPatientId(Number(stored.patientId));
        return;
      }

      try {
        const info = await apiGetMyPatientId();
        if (!isMounted) return;
        setPatientId(info.patientId);

        if (stored) {
          localStorage.setItem(
            "userInfo",
            JSON.stringify({ ...stored, patientId: info.patientId })
          );
        }
      } catch (err) {
        if (!isMounted) return;
        const message =
          (err as Error).message || "Không thể lấy thông tin bệnh nhân";
        setError(message);
        toast.error(message);
      }
    };

    ensurePatientId();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!patientId) return;

    let isMounted = true;
    const controller = new AbortController();

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const pageData = await apiGetPrescriptions({
          patientId,
          page: currentPage,
          limit: PAGE_SIZE,
          signal: controller.signal,
        });

        if (!isMounted) return;
        setPrescriptions(pageData.items ?? []);
        setTotalPages(pageData.totalPages);
      } catch (err) {
        if (!isMounted) return;
        const message = (err as Error).message || "Không thể tải đơn thuốc";
        setError(message);
        toast.error(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [patientId, currentPage]);

  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) setCurrentPage(1);
    else if (totalPages > 0 && currentPage > totalPages)
      setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (searchTerm.trim()) setCurrentPage(1);
  }, [searchTerm]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return prescriptions;
    return prescriptions.filter((rx) => {
      const searchString = Object.values(rx).join(" ").toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
  }, [prescriptions, searchTerm]);

  const buildPageItems = (current: number, total: number, maxButtons = 7) => {
    if (maxButtons % 2 === 0) maxButtons += 1;
    if (total <= maxButtons)
      return Array.from({ length: total }, (_, i) => i + 1);

    const items: (number | "...")[] = [];
    const side = Math.floor(maxButtons / 2);
    let start = Math.max(2, current - side);
    let end = Math.min(total - 1, current + side);

    if (current <= side) {
      start = 2;
      end = maxButtons - 1;
    } else if (current > total - side) {
      start = total - (maxButtons - 2);
      end = total - 1;
    }

    items.push(1);
    if (start > 2) items.push("...");
    for (let i = start; i <= end; i++) items.push(i);
    if (end < total - 1) items.push("...");
    items.push(total);

    return items;
  };

  const handlePageChange = (pageNumber: number) => {
    if (totalPages < 2) return;
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const pageItems =
    totalPages >= 2 ? buildPageItems(currentPage, totalPages, 7) : [];

  return (
    <div className="md:flex-row min-h-screen p-4 mx-auto max-w-screen-2xl px-0 lg:px-0 gap-6">
      <h2 className="text-2xl font-bold text-center md:text-left">
        Danh sách đơn thuốc
      </h2>

      <div className="mt-4">
        <input
          type="text"
          placeholder="Tìm đơn thuốc..."
          className="border border-gray-300 rounded-sm px-4 py-2 w-full sm:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="max-w-full mt-6 overflow-x-auto rounded-sm border border-gray-200">
        <table className="min-w-[900px] w-full text-left text-sm text-gray-700">
          <thead className="bg-sky-500 text-white">
            <tr>
              <th className="px-6 py-3">Mã đơn</th>
              <th className="px-6 py-3">Ngày kê</th>
              <th className="px-6 py-3">Bác sĩ</th>
              <th className="px-6 py-3">Chẩn đoán</th>
              <th className="px-6 py-3">Chức năng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} columns={7} />
                ))}
              </>
            ) : filtered.length > 0 ? (
              filtered.map((rx) => (
                <tr key={rx.code} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {rx.code}
                  </td>
                  <td className="px-6 py-4">
                    {formatDateOnly(rx.prescribedAt)}
                  </td>
                  <td className="px-6 py-4">{rx.doctorName}</td>
                  <td className="px-6 py-4">{rx.diagnosis}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/user/prescriptions/details/${encodeURIComponent(
                        rx.code
                      )}`}
                      className="bg-primary-linear text-white text-sm px-3 py-2 rounded-[var(--rounded)] cursor-pointer"
                    >
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                  {error || "Không có đơn thuốc nào"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages >= 2 && (
        <div className="flex items-center justify-between py-4">
          <p className="font-semibold px-4 text-black">
            Trang{" "}
            <span className="font-semibold text-black">{currentPage}</span>
            {" - "}
            <span className="font-semibold text-black">{totalPages}</span>
          </p>

          <div className="flex items-center px-4 xl:px-10 gap-2">
            {pageItems.map((it, idx) =>
              it === "..." ? (
                <span
                  key={`e-${idx}`}
                  className="px-2 text-slate-400 select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={it}
                  onClick={() => handlePageChange(it as number)}
                  aria-current={it === currentPage ? "page" : undefined}
                  className={[
                    "w-8 h-8 rounded-full border flex items-center justify-center text-sm transition cursor-pointer",
                    it === currentPage
                      ? "bg-sky-400 text-white"
                      : "bg-white text-slate-700 border-slate-300 hover:border-sky-400 hover:text-sky-600",
                  ].join(" ")}
                >
                  {it}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
