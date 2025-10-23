import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Pill,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Power,
} from "lucide-react";
import type { DrugItem } from "../../../types/drug/drug";
import {
  apiCreateDrug,
  apiDeleteDrug,
  apiListDrugs,
  apiToggleDrugActive,
  apiUpdateDrug,
} from "../../../services/drugApi";
import DrugModal from "./DrugModal";
import ConfirmModal from "../../../common/ConfirmModal";
import toast from "react-hot-toast";

export default function DrugManager() {
  const [items, setItems] = useState<DrugItem[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DrugItem | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    apiListDrugs()
      .then(({ items }) => setItems(items))
      .catch(() => toast.error("Không tải được danh sách thuốc"));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (x) =>
        x.name.toLowerCase().includes(q) ||
        x.code.toLowerCase().includes(q) ||
        x.unit.toLowerCase().includes(q)
    );
  }, [items, query]);

  const last = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  useEffect(() => {
    if (page > last) setPage(1);
  }, [last, page]);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (it: DrugItem) => {
    setEditing(it);
    setOpen(true);
  };

  // NHẬN payload từ Modal: KHÔNG có status/isActive
  const submit = async (
    payload: Omit<DrugItem, "id" | "createdAt" | "status" | "isActive">
  ) => {
    try {
      if (editing) {
        // Giữ nguyên isActive hiện tại khi cập nhật
        const upd = await apiUpdateDrug(editing.id, {
          ...payload,
          isActive: editing.isActive,
        });
        setItems((arr) => arr.map((x) => (x.id === upd.id ? upd : x)));
        toast.success("Đã cập nhật thuốc");
      } else {
        // Tạo mới mặc định hoạt động
        const created = await apiCreateDrug({ ...payload, isActive: true });
        setItems((arr) => [created, ...arr]);
        toast.success("Đã thêm thuốc");
      }
    } catch {
      toast.error("Lưu thuốc thất bại");
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
      await apiDeleteDrug(deletingId);
      setItems((arr) => arr.filter((x) => x.id !== deletingId));
      setConfirmOpen(false);
      setDeletingId(null);
      toast.success("Đã xoá thuốc");
    } catch (e) {
      toast.error((e as Error).message || "Xoá thuốc thất bại");
    } finally {
      setConfirmLoading(false);
    }
  };

  const toggleActive = async (it: DrugItem) => {
    setTogglingId(it.id);
    try {
      await apiToggleDrugActive(it.id, !it.isActive);
      setItems((arr) =>
        arr.map((x) => (x.id === it.id ? { ...x, isActive: !it.isActive } : x))
      );
      toast.success(!it.isActive ? "Đã bật hoạt động" : "Đã tắt hoạt động");
    } catch {
      toast.error("Đổi trạng thái hoạt động thất bại");
    } finally {
      setTogglingId(null);
    }
  };

  const inventoryBadge = (stock: number) =>
    stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700";

  const activeBadge = (active: boolean) =>
    active ? "bg-green-200 text-green-600" : "bg-slate-200 text-slate-600";

  return (
    <section className="bg-white rounded-xl shadow-xs border p-4 sm:p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-sky-400" />
          <h2 className="font-bold">Quản lý thuốc</h2>
          <span className="text-sm text-slate-500">
            ({filtered.length} mặt hàng)
          </span>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm tên, mã, đơn vị…"
            className="w-full rounded-[var(--rounded)] border pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <button
          onClick={openCreate}
          className="cursor-pointer rounded-[var(--rounded)] bg-primary-linear text-white px-3 py-2"
        >
          + Thêm thuốc
        </button>
      </header>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-sky-400 text-white">
              <th className="px-3 py-2 text-left">Mã thuốc</th>
              <th className="px-3 py-2 text-left">Tên thuốc</th>
              <th className="px-3 py-2">Đơn vị</th>
              <th className="px-3 py-2">Giá</th>
              <th className="px-3 py-2">Số lượng</th>
              <th className="px-3 py-2">Tồn kho</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-500">
                  Chưa có thuốc.
                </td>
              </tr>
            )}

            {paged.map((d) => {
              const canDelete = !d.isActive; // hoặc chặt hơn: !d.isActive && d.stock === 0
              return (
                <tr
                  key={d.id}
                  className="text-center border-b last:border-none"
                >
                  <td className="px-3 py-2 text-left font-medium">{d.code}</td>
                  <td className="px-3 py-2 text-left font-bold">{d.name}</td>
                  <td className="px-3 py-2">{d.unit}</td>
                  <td className="px-3 py-2 text-red-500 font-semibold">
                    {d.price.toLocaleString("vi-VN")} ₫
                  </td>

                  <td className="px-3 py-2">
                    {d.stock.toLocaleString("vi-VN")}
                  </td>

                  {/* Trạng thái tồn kho theo stock */}
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${inventoryBadge(
                        d.stock
                      )}`}
                    >
                      {d.stock > 0 ? "Còn hàng" : "Hết hàng"}
                    </span>
                  </td>

                  {/* Hoạt động / Không hoạt động */}
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${activeBadge(
                          d.isActive
                        )}`}
                      >
                        {d.isActive ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </td>

                  {/* Thao tác */}
                  <td className="py-2 pr-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
                      <button
                        disabled={togglingId === d.id}
                        onClick={() => toggleActive(d)}
                        className={`cursor-pointer inline-flex items-center rounded-[var(--rounded)] px-2 py-2 ${
                          d.isActive
                            ? "bg-warning-linear text-white"
                            : "bg-success-linear text-white"
                        }`}
                        title={d.isActive ? "Tạm khóa" : "Đang hoạt động"}
                      >
                        {togglingId === d.id ? (
                          "Đang đổi…"
                        ) : (
                          <Power className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(d)}
                        className="bg-primary-linear text-white cursor-pointer inline-flex items-center gap-1 rounded-[var(--rounded)] px-2 py-2"
                        title="Sửa"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => canDelete && askDelete(d.id)}
                        disabled={!canDelete}
                        className={`cursor-pointer inline-flex items-center gap-1 rounded-[var(--rounded)] px-2 py-2 text-white ${
                          canDelete
                            ? "bg-error-linear"
                            : "bg-slate-300 cursor-not-allowed"
                        }`}
                        title={
                          canDelete ? "Xoá" : "Chỉ xoá khi KHÔNG hoạt động"
                        }
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Trang {Math.min(page, last)} - {last}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="cursor-pointer px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => setPage(Math.min(last, page + 1))}
            disabled={page === last}
            className="cursor-pointer px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* DỜI ConfirmModal RA NGOÀI map để không render N cái cùng lúc */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doDelete}
        loading={confirmLoading}
        title="Xoá thuốc"
        description="Bạn có chắc muốn xoá thuốc này? Thao tác không thể hoàn tác."
        confirmText="Xoá"
        cancelText="Huỷ"
        danger
      />

      <DrugModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing ?? undefined}
        // Modal trả về: { code, name, unit, price, stock }
        onSubmit={async (payloadNoStatusNoActive) => {
          await submit(payloadNoStatusNoActive);
          setOpen(false);
        }}
      />
    </section>
  );
}
