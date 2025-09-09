import React, { useEffect, useMemo, useState } from "react";
import { Search, FileUser } from "lucide-react";
import type { Patient } from "../../../types/doctor/doctor";
import { Link } from "react-router-dom";

type Props = {
  items: Patient[];
  perPage?: number;
  title?: string;
  onSetStatus?: (id: number, status: Patient["status"]) => void; // 👈 thêm
};

export default function PatientListToday({
  items,
  perPage = 8,
  title = "Danh sách bệnh nhân hôm nay",
  onSetStatus,
}: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.phone ?? "").includes(q)
    );
  }, [items, query]);

  const lastPage = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  useEffect(() => {
    if (page > lastPage) setPage(1);
  }, [lastPage, page]);

  const onChangeQuery: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setQuery(e.target.value);

  const statusClass = (s: Patient["status"]) => {
    const map: Record<Patient["status"], string> = {
      "Chờ khám": "bg-yellow-100 text-yellow-700",
      "Đã đặt": "bg-blue-100 text-blue-700",
      "Đã khám": "bg-green-100 text-green-700",
      "Đã hủy": "bg-red-100 text-red-700",
    };
    return map[s] ?? "bg-slate-100 text-slate-700";
  };

  return (
    <section className="bg-white rounded-xl shadow-xs border p-4 sm:p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <FileUser className="w-5 h-5 text-sky-400" />
          <h2 className="font-bold">{title}</h2>
          <span className="text-sm text-slate-500">
            ({filtered.length} bệnh nhân)
          </span>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            value={query}
            onChange={onChangeQuery}
            placeholder="Tìm tên, SĐT, mã hồ sơ…"
            className="w-full rounded-lg border pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </header>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-sky-500 text-white">
              <th className="px-3 py-2 text-left">Mã hồ sơ</th>
              <th className="px-3 py-2 text-left">Bệnh nhân</th>
              <th className="px-3 py-2">Giới</th>
              <th className="px-3 py-2">Năm sinh</th>
              <th className="px-3 py-2">SĐT</th>
              <th className="px-3 py-2">Giờ khám</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-500">
                  Không có bệnh nhân phù hợp.
                </td>
              </tr>
            )}

            {paged.map((p) => (
              <tr key={p.id} className="text-center border-b last:border-none">
                <td className="px-3 py-2 text-left font-medium">{p.code}</td>
                <td className="px-3 py-2 text-left">{p.name}</td>
                <td className="px-3 py-2">{p.sex}</td>
                <td className="px-3 py-2">{p.dob.slice(0, 4)}</td>
                <td className="px-3 py-2">{p.phone ?? "-"}</td>
                <td className="px-3 py-2">{p.visitTime}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(
                      p.status
                    )}`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="py-2 pr-3">
                  <div className="flex items-center justify-center gap-2">
                    {/* Select trạng thái */}
                    <select
                      value={p.status}
                      onChange={(e) =>
                        onSetStatus?.(p.id, e.target.value as Patient["status"])
                      }
                      className="rounded-md border px-2 py-1 text-sm focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="Chờ khám">Chờ khám</option>
                      <option value="Đã đặt">Đã đặt</option>
                      <option value="Đã khám">Đã khám</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>

                    {/* Nút mở workspace */}
                    <Link
                      to="/cms/patient-list/workspace"
                      className="cursor-pointer inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:bg-gray-50"
                      title="Khám bệnh"
                    >
                      Khám bệnh
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ListPagination
        total={filtered.length}
        perPage={perPage}
        page={page}
        setPage={setPage}
      />
    </section>
  );
}

/* Pagination giống style bên AppointmentList */
function ListPagination({
  total,
  perPage,
  page,
  setPage,
}: {
  total: number;
  perPage: number;
  page: number;
  setPage: (n: number) => void;
}) {
  const last = Math.max(1, Math.ceil(total / perPage));
  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-slate-500">
        Trang {Math.min(page, last)}/{last} — Tổng {total} bệnh nhân
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="cursor-pointer px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50"
        >
          Trước
        </button>
        <button
          onClick={() => setPage(Math.min(last, page + 1))}
          disabled={page === last}
          className="cursor-pointer px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
