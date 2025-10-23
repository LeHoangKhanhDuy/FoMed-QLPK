import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import type { CreateSpecialtyPayload, SpecialtyItem, UpdateSpecialtyPayload } from "../../../types/specialty/specialtyType";


// ===================== PROPS =====================
type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<SpecialtyItem>;
  onSubmit: (
    payload: CreateSpecialtyPayload | UpdateSpecialtyPayload
  ) => Promise<void>;
};

// ===================== COMPONENT =====================
export default function SpecialtyModal({
  open,
  onClose,
  initial,
  onSubmit,
}: Props) {
  const isEditing = !!initial?.specialtyId;

  const [form, setForm] = useState<
    CreateSpecialtyPayload & UpdateSpecialtyPayload
  >({
    name: initial?.name ?? "",
    code: initial?.code ?? null,
    description: initial?.description ?? null,
    isActive: initial?.isActive ?? true,
  });

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    // Reset form
    setForm({
      name: initial?.name ?? "",
      code: initial?.code ?? null,
      description: initial?.description ?? null,
      isActive: initial?.isActive ?? true,
    });
    setErr(null);
  }, [open, initial]);

  const ctrl =
    "mt-1 block w-full rounded-[var(--rounded)] border bg-white/90 px-4 py-3 text-[16px] leading-6 shadow-xs outline-none focus:ring-2 focus:ring-sky-500";

  const submit = async () => {
    // Validate
    if (!form.name || form.name.trim().length === 0) {
      return setErr("Tên chuyên khoa không được để trống");
    }

    if (form.name.trim().length > 150) {
      return setErr("Tên chuyên khoa không được vượt quá 150 ký tự");
    }

    if (form.code && form.code.trim().length > 50) {
      return setErr("Mã chuyên khoa không được vượt quá 50 ký tự");
    }

    if (form.description && form.description.trim().length > 500) {
      return setErr("Mô tả không được vượt quá 500 ký tự");
    }

    setLoading(true);
    try {
      const payload: CreateSpecialtyPayload | UpdateSpecialtyPayload = {
        name: form.name.trim(),
        code: form.code?.trim() || null,
        description: form.description?.trim() || null,
        ...(isEditing ? { isActive: form.isActive } : {}),
      };

      await onSubmit(payload);
      onClose();
    } catch (e) {
      const error = e as Error;
      setErr(error.message || "Không lưu được chuyên khoa");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-3 sm:mx-0 bg-white rounded-xl shadow-lg p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-xl uppercase">
            {isEditing ? "Sửa chuyên khoa" : "Thêm chuyên khoa mới"}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {err && <p className="mb-3 text-sm text-rose-600">{err}</p>}

        <div className="space-y-3">
          {/* Tên chuyên khoa */}
          <label className="text-sm">
            <span className="block mb-1 text-slate-600">
              Tên chuyên khoa <span className="text-rose-500">*</span>
            </span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={ctrl}
              placeholder="VD: Tim mạch, Nội khoa, Ngoại khoa..."
              maxLength={150}
              required
            />
          </label>

          {/* Mã chuyên khoa */}
          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Mã chuyên khoa</span>
            <input
              value={form.code ?? ""}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className={ctrl}
              placeholder="VD: TIM, NOI, NGOAI..."
              maxLength={50}
            />
          </label>

          {/* Mô tả */}
          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Mô tả</span>
            <textarea
              value={form.description ?? ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className={ctrl}
              rows={4}
              placeholder="Mô tả ngắn về chuyên khoa..."
              maxLength={500}
            />
            <p className="text-xs text-slate-400 mt-1">
              {form.description?.length || 0}/500 ký tự
            </p>
          </label>

          {/* Trạng thái (chỉ hiện khi edit) */}
          {isEditing && (
            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                className="cursor-pointer h-4 w-4"
              />
              <span>Đang hoạt động</span>
            </label>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-2 rounded-[var(--rounded)] border hover:bg-gray-50"
          >
            Huỷ
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="cursor-pointer px-4 py-2 rounded-[var(--rounded)] bg-primary-linear text-white inline-flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
