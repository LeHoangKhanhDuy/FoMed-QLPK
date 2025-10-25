import { useEffect, useMemo, useState } from "react";
import { Save, X, Upload, Image as ImageIcon } from "lucide-react";
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
      imageUrl: initial?.imageUrl ?? null,
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
          <h3 className="font-semibold text-xl uppercase flex-1 text-center">
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
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Mã dịch vụ</span>
              <span className="text-red-500">*</span>
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

          {/* Mô tả */}
          <label className="text-sm col-span-2">         
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Mô tả</span>
              <span className="text-red-500">*</span>
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

          {/* Giá & Thời lượng */}
          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Đơn giá (VNĐ)</span>
              <span className="text-red-500">*</span>
            </div>
            <input
              type="text"
              value={
                form.basePrice !== null && form.basePrice !== undefined
                  ? form.basePrice.toLocaleString("vi-VN")
                  : ""
              }
              onChange={(e) => {
                // Xóa tất cả ký tự không phải số
                const rawValue = e.target.value.replace(/\D/g, "");
                setForm({
                  ...form,
                  basePrice: rawValue === "" ? null : Number(rawValue),
                });
              }}
              className={ctrl}
              placeholder="VD: 500.000"
            />
          </label>

          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Thời lượng (phút)</span>
              <span className="text-red-500">*</span>
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

          {/* Loại dịch vụ */}
          <SelectMenu<number>
            label="Loại dịch vụ"
            required
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

          {/* Upload ảnh */}
          <div className="col-span-2">
            <label className="text-sm">
              <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Ảnh dịch vụ</span>
              <span className="text-red-500">*</span>
            </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Input URL */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="url"
                      value={form.imageUrl ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, imageUrl: e.target.value })
                      }
                      className={ctrl}
                      placeholder="Nhập URL ảnh hoặc upload file"
                    />
                    <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Upload button */}
                <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-3 bg-sky-50 border-2 border-dashed border-sky-300 rounded-[var(--rounded)] hover:bg-sky-100 transition-colors">
                  <Upload className="w-5 h-5 text-sky-600" />
                  <span className="text-sm font-medium text-sky-600">
                    Upload
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // TODO: Upload to server and get URL
                        // For now, create a local preview URL
                        const url = URL.createObjectURL(file);
                        setForm({ ...form, imageUrl: url });
                        // Show warning that this is temporary
                        setErr(
                          "⚠️ Chức năng upload đang phát triển. Vui lòng nhập URL ảnh."
                        );
                      }
                    }}
                  />
                </label>
              </div>
            </label>

            {/* Image preview */}
            {form.imageUrl && (
              <div className="mt-3 relative inline-block">
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-slate-200"
                  onError={() => {
                    setErr("❌ URL ảnh không hợp lệ");
                  }}
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imageUrl: null })}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Xóa ảnh"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

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
