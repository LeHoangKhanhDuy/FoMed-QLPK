import { useEffect, useMemo, useState } from "react";
import { Search, Pill, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { DrugItem } from "../../../types/drug/drug";
import {
  apiCreateDrug,
  apiDeleteDrug,
  apiListDrugs,
  apiUpdateDrug,
} from "../../../types/drug/mockDrugApi";
import DrugModal from "./DrugModal";
import ConfirmModal from "../../../common/ConfirmModal";

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

  useEffect(() => {
    apiListDrugs().then(setItems);
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

  const submit = async (payload: Omit<DrugItem, "id" | "createdAt">) => {
    if (editing) {
      const upd = await apiUpdateDrug(editing.id, payload);
      setItems((arr) => arr.map((x) => (x.id === upd.id ? upd : x)));
    } else {
      const created = await apiCreateDrug(payload);
      setItems((arr) => [created, ...arr]);
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
    } finally {
      setConfirmLoading(false);
    }
  };

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
              <th className="px-3 py-2">Tồn kho</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-500">
                  Chưa có thuốc.
                </td>
              </tr>
            )}

            {paged.map((d) => (
              <tr key={d.id} className="text-center border-b last:border-none">
                <td className="px-3 py-2 text-left font-medium">{d.code}</td>
                <td className="px-3 py-2 text-left font-bold">{d.name}</td>
                <td className="px-3 py-2">{d.unit}</td>
                <td className="px-3 py-2 text-red-500 font-semibold">
                  {d.price.toLocaleString("vi-VN")} ₫
                </td>

                {/* Ô tồn kho: chỉ input số lượng */}
                <td className="px-3 py-2">{d.stock.toLocaleString("vi-VN")}</td>

                {/* Trạng thái: luôn tính từ stock để hiển thị đúng */}
                <td className="px-3 py-2">
                  {d.stock > 0 ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      Còn hàng
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      Hết hàng
                    </span>
                  )}
                </td>

                <td className="py-2 pr-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
                    <button
                      onClick={() => openEdit(d)}
                      className="cursor-pointer inline-flex items-center gap-1 rounded-[var(--rounded)] border px-2 py-1 hover:bg-gray-50"
                      title="Sửa"
                    >
                      <Pencil className="w-4 h-4" /> Sửa
                    </button>
                    <button
                      onClick={() => askDelete(d.id)}
                      className="cursor-pointer inline-flex items-center gap-1 rounded-[var(--rounded)] bg-red-50 text-red-500 px-2 py-1 hover:bg-rose-100"
                      title="Xoá"
                    >
                      <Trash2 className="w-4 h-4" /> Xoá
                    </button>
                  </div>
                  {/* Modal xác nhận dùng chung */}
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
                </td>
              </tr>
            ))}
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

      <DrugModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing ?? undefined}
        onSubmit={submit}
      />
    </section>
  );
}
