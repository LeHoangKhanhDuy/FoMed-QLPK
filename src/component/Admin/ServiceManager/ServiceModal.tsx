import { useEffect, useMemo, useState } from "react";
import { Save, X } from "lucide-react";
import type {
  CreateServicePayload,
  ServiceItem,
} from "../../../types/serviceType/service";
import { apiListServiceCategories, type ServiceCategory } from "../../../services/serviceCate";
import { SelectMenu, type SelectOption } from "../../ui/select-menu";

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
    code: initial?.code ?? null,
    name: initial?.name ?? "",
    description: initial?.description ?? null,
    basePrice: initial?.basePrice ?? null, // cho phép null
    durationMin: initial?.durationMin ?? null,
    categoryId: initial?.category?.categoryId ?? null,
    isActive: initial?.isActive ?? true,
    imageUrl: initial?.imageUrl ?? null,
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // NEW: danh mục
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingCate, setLoadingCate] = useState(false);

  useEffect(() => {
    if (!open) return;

    // reset form theo initial mỗi lần mở
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

    // tải danh mục (mặc định lấy danh mục đang hoạt động)
    setLoadingCate(true);
    apiListServiceCategories({ isActive: true, limit: 200 })
      .then((res) => setCategories(res.items))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCate(false));
  }, [open, initial]);

  const ctrl =
    "mt-1 block w-full rounded-[var(--rounded)] border bg-white/90 px-4 py-3 text-[16px] leading-6 shadow-xs outline-none focus:ring-2 focus:ring-sky-500";

  const cateOptions: SelectOption<number>[] = useMemo(
    () =>
      categories.map((c) => ({
        value: c.categoryId, // Đảm bảo categoryId là duy nhất
        label: c.name || `#${c.categoryId}`,
      })),
    [categories]
  );

  const submit = async () => {
    // Validate tối thiểu
    if (!form.name?.trim()) return setErr("Vui lòng nhập tên dịch vụ");
    if (form.basePrice !== null && Number(form.basePrice) < 0)
      return setErr("Đơn giá không hợp lệ");
    if (form.durationMin !== null && Number(form.durationMin) < 0)
      return setErr("Thời lượng không hợp lệ");
    if (form.categoryId === null || form.categoryId === undefined)
      return setErr("Vui lòng chọn loại dịch vụ");

    setLoading(true);
    try {
      await onSubmit({
        code: form.code?.trim() || null,
        name: form.name.trim(),
        description: form.description?.trim() || null,
        basePrice: form.basePrice, // đã là number | null
        durationMin: form.durationMin,
        categoryId: form.categoryId, // number | null
        isActive: form.isActive,
        imageUrl: form.imageUrl?.trim() || null,
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
          {/* Mã & Tên */}
          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Mã dịch vụ</span>
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

          {/* Mô tả */}
          <label className="text-sm col-span-2">
            <span className="block mb-1 text-slate-600">Mô tả</span>
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

          {/* Giá & Thời lượng */}
          <label className="text-sm">
            <span className="block mb-2 text-slate-600">Đơn giá (VNĐ)</span>
            <input
              type="number"
              min={0}
              value={form.basePrice ?? ""} // hiển thị rỗng nếu null
              onChange={(e) =>
                setForm({
                  ...form,
                  basePrice:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className={ctrl}
              placeholder="VD: 500000"
            />
          </label>

          <label className="text-sm">
            <span className="block mb-2 text-slate-600">Thời lượng (phút)</span>
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

          {/* Loại dịch vụ */}
          <SelectMenu<number>
            label="Loại dịch vụ"
            value={form.categoryId ?? ""}
            options={cateOptions}
            placeholder={loadingCate ? "Đang tải..." : "Chọn loại dịch vụ"}
            onChange={(v) =>
              setForm({
                ...form,
                categoryId: v === "" ? null : Number(v),
              })
            }
            className="col-span-2 sm:col-span-1"
          />

          {/* (Nếu muốn bật/tắt hoạt động, bạn có thể mở lại checkbox dưới đây) */}
          {/* <label className="text-sm flex items-center gap-2 col-span-2">
            <input
              type="checkbox"
              checked={!!form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="cursor-pointer h-4 w-4"
            />
            <span>Đang hoạt động</span>
          </label> */}
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
            className="cursor-pointer px-3 py-2 rounded-[var(--rounded)] bg-primary-linear text-white inline-flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" /> Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
