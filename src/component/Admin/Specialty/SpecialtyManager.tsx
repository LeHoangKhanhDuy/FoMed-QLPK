import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Stethoscope,
  Pencil,
  Power,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../../../common/ConfirmModal";
import type { CreateSpecialtyPayload, SpecialtyItem, UpdateSpecialtyPayload } from "../../../types/specialty/specialtyType";
import { apiActivateSpecialty, apiCreateSpecialty, apiDeactivateSpecialty, apiGetSpecialties, apiUpdateSpecialty } from "../../../services/specialtyApi";
import SpecialtyModal from "./SpecialtyModal";
import { formatDateTime } from "../../../Utils/datetime";


// ===================== MAIN COMPONENT =====================
export default function SpecialtyManager() {
  const [items, setItems] = useState<SpecialtyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const last = Math.max(1, Math.ceil(total / pageSize));

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SpecialtyItem | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  const typingRef = useRef<number | null>(null);

  const fetchData = async (opts?: { keepPage?: boolean }) => {
    try {
      setLoading(true);
      const res = await apiGetSpecialties({
        page: opts?.keepPage ? page : 1,
        limit: pageSize,
        search: query.trim() || undefined,
      });
      
      // Debug: Kiểm tra response data
      console.log("🔍 Specialty API Response:", res);
      if (res.items.length > 0) {
        console.log("📋 First item:", res.items[0]);
      }
      
      setItems(res.items);
      setTotal(res.total);
      if (!opts?.keepPage) setPage(res.page);
    } catch {
      toast.error("Không tải được danh sách chuyên khoa");
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

  const openEdit = (it: SpecialtyItem) => {
    setEditing(it);
    setOpen(true);
  };

  const submit = async (
    payload: CreateSpecialtyPayload | UpdateSpecialtyPayload
  ) => {
    try {
      setLoading(true);
      if (editing) {
        await apiUpdateSpecialty(
          editing.specialtyId,
          payload as UpdateSpecialtyPayload
        );
        toast.success("Đã cập nhật chuyên khoa");
      } else {
        await apiCreateSpecialty(payload as CreateSpecialtyPayload);
        toast.success("Đã tạo chuyên khoa");
      }
      setOpen(false);
      await fetchData();
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Không lưu được chuyên khoa");
    } finally {
      setLoading(false);
    }
  };

  // const askDelete = (id: number) => {
  //   setDeletingId(id);
  //   setConfirmOpen(true);
  // };

  const doDelete = async () => {
    if (!deletingId) return;
    setConfirmLoading(true);
    try {
      await apiDeactivateSpecialty(deletingId);
      setConfirmOpen(false);
      setDeletingId(null);
      toast.success("Đã vô hiệu hóa chuyên khoa");
      await fetchData({ keepPage: true });
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Không vô hiệu hóa được chuyên khoa");
    } finally {
      setConfirmLoading(false);
    }
  };

  const toggleActive = async (it: SpecialtyItem) => {
    try {
      if (it.isActive) {
        await apiDeactivateSpecialty(it.specialtyId);
      } else {
        await apiActivateSpecialty(it.specialtyId);
      }
      // cập nhật nhanh UI
      setItems((arr) =>
        arr.map((x) =>
          x.specialtyId === it.specialtyId ? { ...x, isActive: !x.isActive } : x
        )
      );
      toast.success(
        it.isActive ? "Đã vô hiệu hóa chuyên khoa" : "Đã kích hoạt chuyên khoa"
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
          <Stethoscope className="w-5 h-5 text-sky-400" />
          <h2 className="font-bold">Quản lý chuyên khoa</h2>
          <span className="text-sm text-slate-500">({total} chuyên khoa)</span>
        </div>

        <div className="space-y-1 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên, mã chuyên khoa..."
              className="mt-1 block w-full rounded-[var(--rounded)] border bg-white/90 pl-9 pr-3 py-3 text-[16px] leading-6 text-left shadow-xs outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            onClick={openCreate}
            className="mt-1 cursor-pointer h-12 rounded-[var(--rounded)] bg-primary-linear text-white px-4 text-sm font-medium"
          >
            + Thêm chuyên khoa
          </button>
        </div>
      </header>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-sky-400 text-white">
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Mã chuyên khoa</th>
              <th className="px-3 py-2 text-left">Tên chuyên khoa</th>
              <th className="px-3 py-2 text-left">Mô tả</th>
              <th className="px-3 py-2 text-center">Số bác sĩ</th>
              <th className="px-3 py-2 text-center">Ngày tạo</th>
              <th className="px-3 py-2 text-center">Ngày cập nhật</th>
              <th className="px-3 py-2 text-center">Trạng thái</th>
              <th className="px-3 py-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500">
                  Đang tải dữ liệu…
                </td>
              </tr>
            )}

            {!loading && showing.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}

            {!loading &&
              showing.map((spec) => (
                <tr
                  key={spec.specialtyId}
                  className="text-center border-b last:border-none"
                >
                  <td className="px-3 py-2 text-left">
                    {spec.specialtyId }
                  </td>
                  <td className="px-3 py-2 text-left">
                    {spec.code || "-"}
                  </td>
                  <td className="px-3 py-2 text-left font-bold">{spec.name}</td>
                  <td className="px-3 py-2 text-left text-slate-600">
                    {spec.description ? (
                      <span className="line-clamp-2">{spec.description}</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {spec.doctorCount ?? 0} bác sĩ
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-600 text-xs">
                    {formatDateTime(spec.createdAt)}
                  </td>
                  <td className="px-3 py-2 text-slate-600 text-xs">
                    {formatDateTime(spec.updatedAt)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        spec.isActive
                          ? "bg-green-200 text-green-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {spec.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
                      <button
                        onClick={() => openEdit(spec)}
                        className="bg-primary-linear text-white cursor-pointer inline-flex items-center justify-center gap-1 rounded-[var(--rounded)] px-2 py-2"
                        title="Sửa"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => toggleActive(spec)}
                        className={`cursor-pointer inline-flex items-center justify-center gap-1 rounded-[var(--rounded)] px-2 py-2 ${
                          spec.isActive
                            ? "bg-warning-linear text-white"
                            : "bg-success-linear text-white"
                        }`}
                        title={spec.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                      >
                        <Power className="w-5 h-5" />
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
      <SpecialtyModal
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
        title="Vô hiệu hóa chuyên khoa"
        description="Bạn có chắc muốn vô hiệu hóa chuyên khoa này?"
        confirmText="Xác nhận"
        cancelText="Huỷ"
        danger
      />
    </section>
  );
}
