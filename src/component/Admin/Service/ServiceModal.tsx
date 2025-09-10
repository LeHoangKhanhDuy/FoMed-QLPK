import { useEffect, useState } from "react";

import { Save, X } from "lucide-react";
import type { ServiceItem, ServiceKind, ServiceStatus } from "../../../types/service/service";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<ServiceItem>;
  onSubmit: (payload: Omit<ServiceItem, "id" | "createdAt">) => Promise<void>;
};

const kindOptions: Array<{ v: ServiceKind; label: string }> = [
  { v: "exam", label: "Khám" },
  { v: "lab", label: "Xét nghiệm" },
  { v: "imaging", label: "Chẩn đoán hình ảnh" },
  { v: "procedure", label: "Thủ thuật" },
];

export default function ServiceModal({
  open,
  onClose,
  initial,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<Omit<ServiceItem, "id" | "createdAt">>({
    code: initial?.code ?? "",
    name: initial?.name ?? "",
    kind: (initial?.kind as ServiceKind) ?? "exam",
    unit: initial?.unit ?? "lượt",
    price: initial?.price ?? 0,
    specimen: initial?.specimen,
    department: initial?.department ?? "",
    status: (initial?.status as ServiceStatus) ?? "active",
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      code: initial?.code ?? "",
      name: initial?.name ?? "",
      kind: (initial?.kind as ServiceKind) ?? "exam",
      unit: initial?.unit ?? "lượt",
      price: initial?.price ?? 0,
      specimen: initial?.specimen,
      department: initial?.department ?? "",
      status: (initial?.status as ServiceStatus) ?? "active",
    });
    setErr(null);
  }, [open, initial]);

  const submit = async () => {
    if (!form.code.trim() || !form.name.trim())
      return setErr("Vui lòng nhập mã và tên dịch vụ");
    if (form.price < 0) return setErr("Đơn giá không hợp lệ");
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } catch {
      setErr("Không lưu được dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">
            {initial?.id ? "Sửa dịch vụ" : "Thêm dịch vụ"}
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
            <span className="block mb-1 text-slate-600">Mã dịch vụ *</span>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>

          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Tên dịch vụ *</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>

          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Nhóm</span>
            <select
              value={form.kind}
              onChange={(e) =>
                setForm({ ...form, kind: e.target.value as ServiceKind })
              }
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
            >
              {kindOptions.map((o) => (
                <option key={o.v} value={o.v}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Đơn vị tính</span>
            <input
              value={form.unit ?? ""}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="lượt, mẫu, lần…"
            />
          </label>

          {form.kind === "lab" && (
            <label className="text-sm">
              <span className="block mb-1 text-slate-600">Loại mẫu (XN)</span>
              <select
                value={form.specimen ?? "blood"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    specimen: e.target.value as NonNullable<
                      ServiceItem["specimen"]
                    >,
                  })
                }
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="blood">Máu</option>
                <option value="urine">Nước tiểu</option>
                <option value="swab">Dịch tỵ hầu</option>
                <option value="stool">Phân</option>
                <option value="other">Khác</option>
              </select>
            </label>
          )}

          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Khoa/Phòng</span>
            <input
              value={form.department ?? ""}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="CĐHA, Xét nghiệm, Khám bệnh…"
            />
          </label>

          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Đơn giá (VNĐ)</span>
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
            <span className="block mb-1 text-slate-600">Trạng thái</span>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as ServiceStatus })
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
