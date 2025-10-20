import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import type {
  ServiceItem,
  ServiceKind,
  ServiceStatus,
} from "../../../types/service";
import { SelectMenu, type SelectOption } from "../../ui/select-menu";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<ServiceItem>;
  onSubmit: (payload: Omit<ServiceItem, "id" | "createdAt">) => Promise<void>;
};

const kindMenuOptions: SelectOption<ServiceKind>[] = [
  { value: "exam", label: "Khám" },
  { value: "lab", label: "Xét nghiệm" },
  { value: "imaging", label: "Chẩn đoán hình ảnh" },
  { value: "procedure", label: "Thủ thuật" },
];

type Specimen = NonNullable<ServiceItem["specimen"]>;
const specimenOptions: SelectOption<Specimen>[] = [
  { value: "blood", label: "Máu" },
  { value: "urine", label: "Nước tiểu" },
  { value: "swab", label: "Dịch tỵ hầu" },
  { value: "stool", label: "Phân" },
  { value: "other", label: "Khác" },
];

const statusOptions: SelectOption<ServiceStatus>[] = [
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Tạm khoá" },
];

type Department = NonNullable<ServiceItem["department"]>;
const departmentOptions: SelectOption<Department>[] = [
  { value: "Khám bệnh", label: "Khám bệnh" },
  { value: "XN Huyết học", label: "XN Huyết học" },
  { value: "XN Sinh hoá", label: "XN Sinh hoá" },
  { value: "CĐHA", label: "CĐHA" },
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

  const ctrl =
    "mt-1 block w-full rounded-[var(--rounded)] border bg-white/90 px-4 py-3 " +
    "text-[16px] leading-6 shadow-xs outline-none focus:ring-2 focus:ring-sky-500";

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
      {/* mx-3 để panel không sát mép trên mobile */}
      <div className="relative w-full max-w-2xl mx-3 sm:mx-0 bg-white rounded-xl shadow-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-xl uppercase">
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

        {/* Luôn 2 cột, mỗi hàng 2 ô */}
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Mã dịch vụ</span>
              <span className="text-red-500">*</span>
            </div>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className={ctrl}
              placeholder="VD: TQ001"
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
              placeholder="VD: Khám tổng quát"
            />
          </label>

          <SelectMenu<ServiceKind>
            label="Nhóm"
            required
            value={form.kind}
            onChange={(v) =>
              setForm((f) => ({ ...f, kind: (v as ServiceKind) || f.kind }))
            }
            options={kindMenuOptions}
          />

          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Đơn vị tính</span>
              <span className="text-red-500">*</span>
            </div>
            <input
              value={form.unit ?? ""}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className={ctrl}
              placeholder="VD: lượt, mẫu, lần"
            />
          </label>

          {/* Loại mẫu (chỉ khi Xét nghiệm) */}
          {form.kind === "lab" && (
            <SelectMenu<Specimen>
              label="Loại mẫu (XN)"
              required
              value={(form.specimen as Specimen) ?? "blood"}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  specimen: (v as Specimen) || f.specimen,
                }))
              }
              options={specimenOptions}
            />
          )}

          <SelectMenu<Department>
            label="Khoa/Phòng"
            required
            value={(form.department as Department) ?? "Khám bệnh"}
            onChange={(v) =>
              setForm((f) => ({
                ...f,
                department: (v as Department) || f.department,
              }))
            }
            options={departmentOptions}
          />

          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-2 text-slate-600">Đơn giá (VNĐ)</span>
              <span className="text-red-500">*</span>
            </div>
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
              className={ctrl}
            />
          </label>

          <SelectMenu<ServiceStatus>
            label="Trạng thái"
            required
            value={form.status}
            onChange={(v) =>
              setForm((f) => ({
                ...f,
                status: (v as ServiceStatus) || f.status,
              }))
            }
            options={statusOptions}
          />
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
