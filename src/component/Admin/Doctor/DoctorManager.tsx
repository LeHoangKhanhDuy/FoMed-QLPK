import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  UserCog,
  Pencil,
  Trash2,
  Power,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../../../common/ConfirmModal";
import { apiActivateDoctor, apiCreateDoctor, apiDeactivateDoctor, apiGetDoctors, apiUpdateDoctor, type CreateDoctorPayload, type DoctorItem, type UpdateDoctorPayload } from "../../../services/doctorMApi";
import DoctorModal from "./DoctorModal";

// ===================== MAIN COMPONENT =====================
export default function DoctorManager() {
  const [items, setItems] = useState<DoctorItem[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const last = Math.max(1, Math.ceil(total / pageSize));

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DoctorItem | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  const typingRef = useRef<number | null>(null);

  const fetchData = async (opts?: { keepPage?: boolean }) => {
    try {
      setLoading(true);
      
      // Đảm bảo page là số hợp lệ trước khi gửi request
      let currentPage = opts?.keepPage ? page : 1;
      if (isNaN(currentPage) || currentPage < 1) {
        currentPage = 1;
      }
      
      const res = await apiGetDoctors({
        page: currentPage,
        limit: pageSize,
        search: query.trim() || undefined,
      });
      
      setItems(res.items || []);
      setTotal(res.total || 0);
      
      if (!opts?.keepPage) {
        // Đảm bảo page từ response là số hợp lệ
        const newPage = Number(res.page);
        if (!isNaN(newPage) && newPage > 0) {
          setPage(newPage);
        } else {
          setPage(1);
        }
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Không tải được danh sách bác sĩ");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce search
  useEffect(() => {
    if (typingRef.current) window.clearTimeout(typingRef.current);
    typingRef.current = window.setTimeout(() => {
      fetchData();
    }, 300);
    return () => {
      if (typingRef.current) window.clearTimeout(typingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // paging
  useEffect(() => {
    fetchData({ keepPage: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    if (page > last) setPage(1);
  }, [last, page]);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (it: DoctorItem) => {
    setEditing(it);
    setOpen(true);
  };

  const submit = async (payload: CreateDoctorPayload | UpdateDoctorPayload) => {
    try {
      setLoading(true);
      if (editing) {
        await apiUpdateDoctor(editing.doctorId, payload as UpdateDoctorPayload);
        toast.success("Đã cập nhật hồ sơ bác sĩ");
      } else {
        await apiCreateDoctor(payload as CreateDoctorPayload);
        toast.success("Đã tạo hồ sơ bác sĩ");
      }
      setOpen(false);
      await fetchData();
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Không lưu được hồ sơ bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  const askDelete = (id: number) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!deletingId) return;
    setConfirmLoading(true);
    try {
      await apiDeactivateDoctor(deletingId);
      setConfirmOpen(false);
      setDeletingId(null);
      toast.success("Đã vô hiệu hóa bác sĩ");
      await fetchData({ keepPage: true });
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Không vô hiệu hóa được bác sĩ");
    } finally {
      setConfirmLoading(false);
    }
  };

  const toggleActive = async (it: DoctorItem) => {
    try {
      if (it.isActive) {
        await apiDeactivateDoctor(it.doctorId);
      } else {
        await apiActivateDoctor(it.doctorId);
      }
      // cập nhật nhanh UI
      setItems((arr) =>
        arr.map((x) =>
          x.doctorId === it.doctorId ? { ...x, isActive: !x.isActive } : x
        )
      );
      toast.success(
        it.isActive ? "Đã vô hiệu hóa bác sĩ" : "Đã kích hoạt bác sĩ"
      );
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Không thay đổi được trạng thái");
    }
  };

  const showing = useMemo(() => items, [items]);

  return (
    <section className="bg-white rounded-xl shadow-xs border p-4 sm:p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <UserCog className="w-5 h-5 text-sky-400" />
          <h2 className="font-bold">Quản lý bác sĩ</h2>
          <span className="text-sm text-slate-500">({total} bác sĩ)</span>
        </div>

        <div className="space-y-1 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên, email, SĐT..."
              className="mt-1 block w-full rounded-[var(--rounded)] border bg-white/90 pl-9 pr-3 py-3 text-[16px] leading-6 text-left shadow-xs outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            onClick={openCreate}
            className="mt-1 cursor-pointer h-12 rounded-[var(--rounded)] bg-primary-linear text-white px-4 text-sm font-medium"
          >
            + Thêm bác sĩ
          </button>
        </div>
      </header>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-sky-400 text-white">
              <th className="px-3 py-2 text-left">Họ tên</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">SĐT</th>
              <th className="px-3 py-2 text-center">Học hàm</th>
              <th className="px-3 py-2 text-center">Chuyên khoa</th>
              <th className="px-3 py-2 text-center">Phòng khám</th>
              <th className="px-3 py-2 text-center">Kinh nghiệm</th>
              <th className="px-3 py-2 text-center">Đánh giá</th>
              <th className="px-3 py-2 text-center">Trạng thái</th>
              <th className="px-3 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={10} className="py-6 text-center text-slate-500">
                  Đang tải dữ liệu…
                </td>
              </tr>
            )}

            {!loading && showing.length === 0 && (
              <tr>
                <td colSpan={10} className="py-6 text-center text-slate-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}

            {!loading &&
              showing.map((doc) => (
                <tr
                  key={doc.doctorId}
                  className="text-center border-b last:border-none"
                >
                  <td className="px-3 py-2 text-left font-bold">
                    {doc.fullName}
                  </td>
                  <td className="px-3 py-2 text-left">{doc.email || "-"}</td>
                  <td className="px-3 py-2 text-left">{doc.phone || "-"}</td>
                  <td className="px-3 py-2">{doc.title || "-"}</td>
                  <td className="px-3 py-2">
                    {doc.primarySpecialtyName || "-"}
                  </td>
                  <td className="px-3 py-2">{doc.roomName || "-"}</td>
                  <td className="px-3 py-2">
                    {doc.experienceYears ? `${doc.experienceYears} năm` : "-"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-yellow-600">
                        {doc.ratingAvg.toFixed(1)} ⭐
                      </span>
                      <span className="text-xs text-slate-500">
                        ({doc.ratingCount} đánh giá)
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        doc.isActive
                          ? "bg-green-200 text-green-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {doc.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
                      <button
                        onClick={() => openEdit(doc)}
                        className="bg-primary-linear text-white cursor-pointer inline-flex items-center justify-center gap-1 rounded-[var(--rounded)] px-2 py-2"
                        title="Sửa"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => toggleActive(doc)}
                        className={`cursor-pointer inline-flex items-center justify-center gap-1 rounded-[var(--rounded)] px-2 py-2 ${
                          doc.isActive
                            ? "bg-warning-linear text-white"
                            : "bg-success-linear text-white"
                        }`}
                        title={doc.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                      >
                        <Power className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => askDelete(doc.doctorId)}
                        className="cursor-pointer inline-flex items-center justify-center gap-1 rounded-[var(--rounded)] bg-error-linear text-white px-2 py-2"
                        title="Xoá"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Trang {Math.min(page, last)} / {last} • {total} mục
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="cursor-pointer px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(last, p + 1))}
            disabled={page === last}
            className="cursor-pointer px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Modal */}
      <DoctorModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing ?? undefined}
        onSubmit={submit}
      />

      {/* Confirm modal */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doDelete}
        loading={confirmLoading}
        title="Vô hiệu hóa bác sĩ"
        description="Bạn có chắc muốn vô hiệu hóa hồ sơ bác sĩ này?"
        confirmText="Xác nhận"
        cancelText="Huỷ"
        danger
      />
    </section>
  );
}
