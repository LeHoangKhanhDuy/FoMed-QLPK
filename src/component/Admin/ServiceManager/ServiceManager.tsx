import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  ClipboardList,
  Pencil,
  Trash2,
  Power,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatVND } from "../../../Utils/formatVND";

import type {
  ServiceItem,
  CreateServicePayload,
  ServiceStatus,
} from "../../../types/serviceType/service";

import ServiceModal from "./ServiceModal";
import ConfirmModal from "../../../common/ConfirmModal";
import {
  createService,
  deleteService,
  getService,
  toggleService,
  updateService,
} from "../../../services/service";

export default function ServiceManager() {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const last = Math.max(1, Math.ceil(total / pageSize));

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  const typingRef = useRef<number | null>(null);

  const fetchData = async (opts?: { keepPage?: boolean }) => {
    try {
      setLoading(true);
      const res = await getService({
        page: opts?.keepPage ? page : 1,
        pageSize,
        keyword: query.trim() || undefined,
      });
      setItems(res.data.items);
      setTotal(res.data.total);
      if (!opts?.keepPage) setPage(res.data.page);
    } catch {
      toast.error("Không tải được danh sách dịch vụ");
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
  const openEdit = (it: ServiceItem) => {
    setEditing(it);
    setOpen(true);
  };

  const submit = async (payload: CreateServicePayload) => {
    try {
      setLoading(true);

      // Chuẩn hóa payload dạng JSON
      const jsonPayload = {
        code: payload.code?.trim() || null,
        name: payload.name.trim(),
        description: payload.description?.trim() || null,
        basePrice: Number(payload.basePrice ?? 0),
        durationMin: payload.durationMin ? Number(payload.durationMin) : null,
        categoryId: Number(payload.categoryId ?? 0),
        isActive: Boolean(payload.isActive),
        imageUrl: payload.imageUrl?.trim() || null, // Gửi imageUrl nếu có
      };

      if (editing) {
        await updateService(editing.serviceId, jsonPayload); // Gửi JSON thay vì FormData
        toast.success("Đã cập nhật dịch vụ");
      } else {
        await createService(jsonPayload); // Gửi JSON thay vì FormData
        toast.success("Đã tạo dịch vụ");
      }

      setOpen(false);
      await fetchData();
    } catch {
      toast.error("Không lưu được dịch vụ");
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
      await deleteService(deletingId);
      setConfirmOpen(false);
      setDeletingId(null);
      toast.success("Đã xoá dịch vụ");
      await fetchData({ keepPage: true });
    } catch (e) {
      const error = e as Error;
      toast.error(error?.message || "Không xoá được dịch vụ");
    } finally {
      setConfirmLoading(false);
    }
  };

  const toggleActive = async (it: ServiceItem) => {
    try {
      const next: ServiceStatus = it.isActive ? "inactive" : "active";
      await toggleService(it.serviceId, next);
      // cập nhật nhanh UI
      setItems((arr) =>
        arr.map((x) =>
          x.serviceId === it.serviceId ? { ...x, isActive: !x.isActive } : x
        )
      );
      toast.success(next === "active" ? "Đã mở dịch vụ" : "Đã khoá dịch vụ");
    } catch {
      toast.error("Không thay đổi được trạng thái");
    }
  };

  const showing = useMemo(() => items, [items]);

  return (
    <section className="bg-white rounded-xl shadow-xs border p-4 sm:p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-sky-400" />
          <h2 className="font-bold">Quản lý danh mục dịch vụ</h2>
          <span className="text-sm text-slate-500">({total} dịch vụ)</span>
        </div>

        <div className="space-y-1 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm mã, tên, mô tả…"
              className="mt-1 block w-full rounded-[var(--rounded)] border bg-white/90 pl-9 pr-3 py-3 text-[16px] leading-6 text-left shadow-xs outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            onClick={openCreate}
            className="mt-1 cursor-pointer h-12 rounded-[var(--rounded)] bg-primary-linear text-white px-4 text-sm font-medium"
          >
            + Thêm dịch vụ
          </button>
        </div>
      </header>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-sky-400 text-white">
              <th className="px-3 py-2 text-left">Mã</th>
              <th className="px-3 py-2 text-left">Tên dịch vụ</th>
              <th className="px-3 py-2 text-center">Mô tả</th>
              <th className="px-3 py-2 text-center">Ảnh</th>
              <th className="px-3 py-2">Đơn giá</th>
              <th className="px-3 py-2">Thời gian (phút)</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2">Chuyên mục</th>
              <th className="px-3 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="py-6 text-center text-slate-500">
                  Đang tải dữ liệu…
                </td>
              </tr>
            )}

            {!loading && showing.length === 0 && (
              <tr>
                <td colSpan={9} className="py-6 text-center text-slate-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}

            {!loading &&
              showing.map((s) => (
                <tr
                  key={s.serviceId}
                  className="text-center border-b last:border-none"
                >
                  <td className="px-3 py-2 text-left font-medium">
                    {s.code ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-left font-bold">{s.name}</td>
                  <td className="px-3 py-2 text-left">
                    <div
                      className="max-w-[400px] overflow-hidden text-ellipsis whitespace-normal line-clamp-2 text-sm text-slate-700"
                      title={s.description || undefined}
                    >
                      {s.description || "-"}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center">
                      {s.imageUrl ? (
                        <div className="relative w-16 h-16 overflow-visible group">
                          {/* Backdrop khi hover */}
                          <div className="fixed inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-40" />
                          
                          <img
                            src={s.imageUrl}
                            alt={s.name}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-slate-200 shadow-sm cursor-pointer transition-all duration-300 group-hover:scale-[2.5] group-hover:z-50 group-hover:shadow-2xl group-hover:border-sky-400 relative"
                            onError={(e) => {
                              // Fallback nếu ảnh lỗi
                              e.currentTarget.src =
                                "https://via.placeholder.com/64?text=No+Image";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center bg-slate-100 rounded-lg border-2 border-dashed border-slate-300">
                          <span className="text-xs text-slate-400">
                            Chưa có
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-red-500 font-semibold">
                    {formatVND(Number(s.basePrice ?? 0))}
                  </td>
                  <td className="px-3 py-2">{s.durationMin ?? "-"}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        s.isActive
                          ? "bg-green-200 text-green-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {s.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {s.category?.name ?? s.category?.categoryId ?? "-"}
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="bg-primary-linear text-white cursor-pointer inline-flex items-center justify-center gap-1 rounded-[var(--rounded)] px-2 py-2"
                        title="Sửa"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => toggleActive(s)}
                        className={`cursor-pointer inline-flex items-center justify-center gap-1 rounded-[var(--rounded)] px-2 py-2 ${
                          s.isActive
                            ? "bg-warning-linear text-white"
                            : "bg-success-linear text-white"
                        }`}
                        title={s.isActive ? "Khoá dịch vụ" : "Mở dịch vụ"}
                      >
                        <Power className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => askDelete(s.serviceId)}
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
          Trang {Math.min(page, last)} / {last} - {total} mục
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
      <ServiceModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing ?? undefined}
        onSubmit={submit}
      />

      {/* Single confirm modal (đặt ngoài map) */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doDelete}
        loading={confirmLoading}
        title="Xoá dịch vụ"
        description="Bạn có chắc muốn xoá dịch vụ này?"
        confirmText="Xoá"
        cancelText="Huỷ"
        danger
      />
    </section>
  );
}
