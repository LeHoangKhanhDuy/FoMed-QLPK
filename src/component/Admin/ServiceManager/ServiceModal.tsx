import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import type {
  CreateServicePayload,
  ServiceItem,
} from "../../../types/serviceType/service";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<ServiceItem>;
  onSubmit: (payload: CreateServicePayload) => Promise<void>;
};

export default function ServiceModal({
  open,
  onClose,
  initial,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<CreateServicePayload>({
    code: initial?.code ?? "",
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    basePrice: initial?.basePrice ?? 0,
    durationMin: initial?.durationMin ?? null,
    categoryId: initial?.category?.categoryId ?? null,
    isActive: initial?.isActive ?? true,
  });

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      code: initial?.code ?? "",
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      basePrice: initial?.basePrice ?? 0,
      durationMin: initial?.durationMin ?? null,
      categoryId: initial?.category?.categoryId ?? null,
      isActive: initial?.isActive ?? true,
    });
    setErr(null);
  }, [open, initial]);

  const ctrl =
    "mt-1 block w-full rounded-[var(--rounded)] border bg-white/90 px-4 py-3 text-[16px] leading-6 shadow-xs outline-none focus:ring-2 focus:ring-sky-500";

  const submit = async () => {
    // validate tối thiểu
    if (!form.name?.trim()) return setErr("Vui lòng nhập tên dịch vụ");
    if (form.basePrice !== null && Number(form.basePrice) < 0)
      return setErr("Đơn giá không hợp lệ");
    if (form.durationMin !== null && Number(form.durationMin) < 0)
      return setErr("Thời lượng không hợp lệ");

    setLoading(true);
    try {
      await onSubmit({
        code: form.code?.toString() || null,
        name: form.name.trim(),
        description: form.description?.toString() || null,
        basePrice: form.basePrice === null ? null : Number(form.basePrice),
        durationMin:
          form.durationMin === null || form.durationMin === undefined
            ? null
            : Number(form.durationMin),
        categoryId:
          form.categoryId === null || form.categoryId === undefined
            ? null
            : Number(form.categoryId),
        isActive: Boolean(form.isActive),
      });
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
      <div className="relative w-full max-w-2xl mx-3 sm:mx-0 bg-white rounded-xl shadow-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-xl uppercase">
            {initial?.serviceId ? "Sửa dịch vụ" : "Thêm dịch vụ"}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {err && <p className="mb-3 text-sm text-rose-600">{err}</p>}

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Mã dịch vụ</span>
            </div>
            <input
              value={form.code ?? ""}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className={ctrl}
              placeholder="VD: KTQ"
            />
          </label>

          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Tên dịch vụ</span>
              <span className="text-red-500">*</span>
            </div>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={ctrl}
              placeholder="VD: Khám Tổng quát"
            />
          </label>

          <label className="text-sm col-span-2">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Mô tả</span>
            </div>
            <textarea
              value={form.description ?? ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className={ctrl}
              rows={3}
              placeholder="Mô tả ngắn…"
            />
          </label>

          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-2 text-slate-600">Đơn giá (VNĐ)</span>
            </div>
            <input
              type="number"
              min={0}
              value={Number(form.basePrice ?? 0)}
              onChange={(e) =>
                setForm({ ...form, basePrice: Number(e.target.value) })
              }
              className={ctrl}
            />
          </label>

          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-2 text-slate-600">
                Thời lượng (phút)
              </span>
            </div>
            <input
              type="number"
              min={0}
              value={form.durationMin ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  durationMin:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className={ctrl}
              placeholder="VD: 60"
            />
          </label>

          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">CategoryId</span>
            </div>
            <input
              type="number"
              min={1}
              value={form.categoryId ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  categoryId:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className={ctrl}
              placeholder="VD: 1"
            />
          </label>

          <label className="text-sm flex items-center gap-2 col-span-2">
            <input
              type="checkbox"
              checked={!!form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="cursor-pointer h-4 w-4"
            />
            <span>Đang hoạt động</span>
          </label>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="cursor-pointer px-3 py-2 rounded-[var(--rounded)] border hover:bg-gray-50"
          >
            Huỷ
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="cursor-pointer px-3 py-2 rounded-[var(--rounded)] bg-primary-linear text-white inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
