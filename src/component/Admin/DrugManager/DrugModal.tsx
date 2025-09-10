import { useEffect, useState } from "react";

import { Save, X } from "lucide-react";
import type { DrugItem, DrugStatus } from "../../../types/drug/drug";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<DrugItem>;
  onSubmit: (payload: Omit<DrugItem, "id" | "createdAt">) => Promise<void>;
};

export default function DrugModal({ open, onClose, initial, onSubmit }: Props) {
  const [form, setForm] = useState<Omit<DrugItem, "id" | "createdAt">>({
    code: initial?.code ?? "",
    name: initial?.name ?? "",
    unit: initial?.unit ?? "viên",
    price: initial?.price ?? 0,
    stock: initial?.stock ?? 0,
    status: (initial?.status as DrugStatus) ?? "active",
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      code: initial?.code ?? "",
      name: initial?.name ?? "",
      unit: initial?.unit ?? "viên",
      price: initial?.price ?? 0,
      stock: initial?.stock ?? 0,
      status: (initial?.status as DrugStatus) ?? "active",
    });
    setErr(null);
  }, [open, initial]);

  const submit = async () => {
    if (!form.name.trim()) return setErr("Vui lòng nhập tên thuốc");
    if (form.price < 0 || form.stock < 0)
      return setErr("Giá/Tồn kho không hợp lệ");
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } catch {
      setErr("Không lưu được thuốc");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">
            {initial?.id ? "Sửa thuốc" : "Thêm thuốc"}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {err && <p className="mb-3 text-sm text-rose-600">{err}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Mã thuốc</span>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Tên thuốc *</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Đơn vị *</span>
            <input
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="viên, ống, gói, ml…"
            />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Giá (VNĐ) *</span>
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Tồn kho *</span>
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) =>
                setForm({ ...form, stock: Number(e.target.value) })
              }
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Trạng thái</span>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as DrugStatus })
              }
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Tạm khoá</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="cursor-pointer px-3 py-2 rounded-md border hover:bg-gray-50"
          >
            Huỷ
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="cursor-pointer px-3 py-2 rounded-md bg-primary-linear text-white disabled:opacity-60 inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
