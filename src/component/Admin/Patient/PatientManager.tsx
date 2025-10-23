import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  BookUser,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  apiListPatients,
  apiDeletePatient,
  type PatientListItem,
} from "../../../services/patientsApi";
import PatientModal from "./PatientModal";
import { getErrorMessage } from "../../../Utils/errorHepler";

export default function PatientManager() {
  const [items, setItems] = useState<PatientListItem[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await apiListPatients({ query, page, limit });
      setItems(res.items);
      setTotal(res.total);
    } catch {
      toast.error("Không tải được danh sách bệnh nhân");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
    if (Number.isNaN(d.getTime())) return "-";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  useEffect(() => {
    fetchList();
  }, [page]); // eslint-disable-line
  useEffect(() => {
    setPage(1); /* reset page */
  }, [query]);

  const lastPage = Math.max(1, Math.ceil(total / limit));

  const onSaved = () => {
    fetchList();
  };
  const onCreate = () => {
    setEditingId(null);
    setOpen(true);
  };
  const onEdit = (id: number) => {
    setEditingId(id);
    setOpen(true);
  };

  const onDelete = async (id: number): Promise<void> => {
    if (!confirm("Xác nhận xoá (ẩn) bệnh nhân này?")) return;
    try {
      await apiDeletePatient(id);
      toast.success("Đã ẩn bệnh nhân");
      fetchList();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Xoá thất bại"));
    }
  };

  const genderLabel = (g?: string | null) =>
    g === "M" ? "Nam" : g === "F" ? "Nữ" : "-";

  return (
    <section className="bg-white rounded-xl shadow-xs border p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <BookUser className="w-5 h-5 text-sky-400" />
          <h2 className="font-bold">Quản lý bệnh nhân</h2>
          <span className="text-sm text-slate-500">({total} dịch vụ)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên, SĐT, mã bệnh nhân…"
              className="pl-9 pr-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            onClick={onCreate}
            className="cursor-pointer flex items-center gap-2 rounded-lg bg-primary-linear text-white px-3 py-2"
          >
            <Plus className="w-4 h-4" /> Thêm bệnh nhân
          </button>
        </div>
      </header>

      <div className="overflow-x-auto rounded-sm border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-sky-400 text-white">
              <th className="py-2 px-3 text-left">Mã</th>
              <th className="py-2 px-3 text-left">Họ tên</th>
              <th className="py-2 px-3">Giới tính</th>
              <th className="py-2 px-3">Ngày sinh</th>
              <th className="py-2 px-3 text-left">Địa chỉ</th>
              <th className="py-2 px-3">Quận/Huyện</th>
              <th className="py-2 px-3">Thành phố</th>
              <th className="py-2 px-3">Tỉnh</th>
              <th className="py-2 px-3">CMND/CCCD</th>
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">SĐT</th>
              <th className="py-2 px-3">Tạo lúc</th>
              <th className="py-2 px-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={13} className="py-6 text-center text-slate-500">
                  Đang tải dữ liệu…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-6 text-center text-slate-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p.patientId} className="border-b last:border-none">
                  <td className="py-2 px-3 font-semibold">
                    {p.patientCode ?? "-"}
                  </td>
                  <td className="py-2 px-3 font-bold">{p.fullName}</td>
                  <td className="py-2 px-3 text-center">
                    {genderLabel(p.gender)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {formatDate(p.dateOfBirth)}
                  </td>
                  <td className="py-2 px-3">{p.address ?? "-"}</td>
                  <td className="py-2 px-3 text-center">{p.district ?? "-"}</td>
                  <td className="py-2 px-3 text-center">{p.city ?? "-"}</td>
                  <td className="py-2 px-3 text-center">{p.province ?? "-"}</td>
                  <td className="py-2 px-3 text-center">
                    {p.identityNo ?? "-"}
                  </td>
                  <td className="py-2 px-3">{p.email ?? "-"}</td>
                  <td className="py-2 px-3 text-center">{p.phone}</td>

                  <td className="py-2 px-3 text-center">
                    {new Date(p.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2 justify-center">
                      <button
                        title="Sửa"
                        onClick={() => onEdit(p.patientId)}
                        className="cursor-pointer p-2 rounded-[var(--rounded)] bg-warning-linear text-white"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        title="Xoá (ẩn)"
                        onClick={() => onDelete(p.patientId)}
                        className="cursor-pointer p-2 rounded-[var(--rounded)] bg-error-linear text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Trang {Math.min(page, lastPage)} / {lastPage}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="cursor-pointer px-3 py-1.5 rounded-md border disabled:opacity-50"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => setPage(Math.min(lastPage, page + 1))}
            disabled={page === lastPage}
            className="cursor-pointer px-3 py-1.5 rounded-md border disabled:opacity-50"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <PatientModal
        open={open}
        editingId={editingId}
        onClose={() => setOpen(false)}
        onSaved={onSaved}
      />
    </section>
  );
}
