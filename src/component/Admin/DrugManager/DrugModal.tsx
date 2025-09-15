import { useEffect, useMemo, useState } from "react";
import { Save, X } from "lucide-react";
import type { DrugItem, DrugStatus } from "../../../types/drug/drug";
import { SelectMenu, type SelectOption } from "../../ui/select-menu";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<DrugItem>;
  onSubmit: (payload: Omit<DrugItem, "id" | "createdAt">) => Promise<void>;
};

const UNIT_OPTIONS = ["viên", "gói", "ống", "chai", "vỉ", "ml", "hộp"] as const;
type Unit = (typeof UNIT_OPTIONS)[number];

const normalizeUnit = (u?: string): Unit =>
  UNIT_OPTIONS.includes(u as Unit) ? (u as Unit) : "viên";

type DrugForm = Omit<DrugItem, "id" | "createdAt" | "unit"> & { unit: Unit };

type Field = "code" | "name" | "unit" | "price" | "stock" | "status";
type FieldErrors = Partial<Record<Field, string>>;

export default function DrugModal({ open, onClose, initial, onSubmit }: Props) {
  const [form, setForm] = useState<DrugForm>({
    code: initial?.code ?? "",
    name: initial?.name ?? "",
    unit: normalizeUnit(initial?.unit),
    price: initial?.price ?? 0,
    stock: initial?.stock ?? 0,
    status: (initial?.status as DrugStatus) ?? "in stock",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  // —— Validators ——
  const vCode = (v: string) => {
    if (!v.trim()) return "Vui lòng nhập mã thuốc";
    if (!/^[A-Za-z0-9\-_]{2,32}$/.test(v))
      return "Mã 2–32 ký tự, chỉ chữ/số, -, _";
    return "";
  };
  const vName = (v: string) => {
    if (!v.trim()) return "Vui lòng nhập tên thuốc";
    if (v.trim().length < 2 || v.trim().length > 120) return "Tên 2–120 ký tự";
    return "";
  };
  const vUnit = (v: string) => {
    if (!UNIT_OPTIONS.includes(v as never))
      return "Vui lòng chọn đơn vị hợp lệ";
    return "";
  };
  const vPrice = (n: number) => {
    if (!Number.isFinite(n)) return "Giá không hợp lệ";
    if (n < 0) return "Giá phải ≥ 0";
    if (!Number.isInteger(n)) return "Giá phải là số nguyên";
    return "";
  };
  const vStock = (n: number) => {
    if (!Number.isFinite(n)) return "Tồn kho không hợp lệ";
    if (n < 0) return "Tồn kho phải ≥ 0";
    if (!Number.isInteger(n)) return "Tồn kho phải là số nguyên";
    return "";
  };
  const vStatus = (s: DrugStatus) => {
    if (s !== "in stock" && s !== "out of stock")
      return "Trạng thái không hợp lệ";
    return "";
  };

  const validateField = (field: Field, value: unknown): string => {
    switch (field) {
      case "code":
        return vCode(String(value));
      case "name":
        return vName(String(value));
      case "unit":
        return vUnit(String(value));
      case "price":
        return vPrice(Number(value));
      case "stock":
        return vStock(Number(value));
      case "status":
        return vStatus(value as DrugStatus);
      default:
        return "";
    }
  };

  const validateForm = (f = form): FieldErrors => {
    const out: FieldErrors = {
      code: validateField("code", f.code),
      name: validateField("name", f.name),
      unit: validateField("unit", f.unit),
      price: validateField("price", f.price),
      stock: validateField("stock", f.stock),
      status: validateField("status", f.status),
    };
    Object.keys(out).forEach((k) => {
      if (!out[k as Field]) delete out[k as Field];
    });
    return out;
  };

  const isValid = useMemo(
    () => Object.keys(validateForm()).length === 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form]
  );

  const unitOptions: SelectOption<Unit>[] = UNIT_OPTIONS.map((u) => ({
    value: u,
    label: u,
  }));

  const statusOptions: SelectOption<DrugStatus>[] = [
    { value: "in stock", label: "Còn hàng" },
    { value: "out of stock", label: "Hết hàng" },
  ];

  // —— Effects ——
  useEffect(() => {
    if (!open) return;
    setForm({
      code: initial?.code ?? "",
      name: initial?.name ?? "",
      unit: normalizeUnit(initial?.unit),
      price: initial?.price ?? 0,
      stock: initial?.stock ?? 0,
      status: (initial?.status as DrugStatus) ?? "in stock",
    });
    setErrors({});
  }, [open, initial]);

  // —— Handlers ——
  const setField =
    <K extends keyof typeof form>(key: K) =>
    (val: (typeof form)[K]) => {
      setForm((f) => ({ ...f, [key]: val }));
      setErrors((e) => {
        const msg = validateField(key as Field, val);
        const next = { ...e };
        if (msg) next[key as Field] = msg;
        else delete next[key as Field];
        return next;
      });
    };

  const onChangePriceText: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const raw = e.target.value.replace(/\D/g, ""); // chỉ giữ số
    const n = raw === "" ? 0 : Number(raw);
    setField("price")(n);
  };

  const onChangeStock: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const n = Math.max(0, Math.floor(Number(e.target.value)));
    setField("stock")(Number.isFinite(n) ? n : 0);
  };

  const submit = async () => {
    const errs = validateForm();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Đồng bộ trạng thái theo tồn kho
    const normalized: Omit<DrugItem, "id" | "createdAt"> = {
      ...form,
      status:
        form.stock > 0
          ? ("in stock" as DrugStatus)
          : ("out of stock" as DrugStatus),
    };

    setLoading(true);
    try {
      await onSubmit(normalized);
      onClose();
    } catch {
      setErrors((e) => ({ ...e, code: e.code ?? "Không lưu được thuốc" }));
    } finally {
      setLoading(false);
    }
  };

  const ctrl = (field: Field) =>
    `mt-1 block w-full rounded-[var(--rounded)] border bg-white/90 px-4 py-3 " +
      "text-[16px] leading-6 shadow-xs outline-none focus:ring-2 focus:ring-sky-500 ${
        errors[field] ? "border-rose-400 focus:ring-rose-400" : ""
      }`;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-3 sm:mx-0 bg-white rounded-xl shadow-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-xl uppercase">
            {initial?.id ? "Sửa thuốc" : "Thêm thuốc"}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Mã thuốc */}
          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Mã thuốc</span>
              <p className="text-red-500">*</p>
            </div>
            <input
              value={form.code}
              onChange={(e) => setField("code")(e.target.value)}
              className={ctrl("code")}
              placeholder="VD: PARA500"
            />
            {errors.code && (
              <p className="mt-1 text-xs text-rose-600">{errors.code}</p>
            )}
          </label>

          {/* Tên thuốc */}
          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Tên thuốc</span>
              <p className="text-red-500">*</p>
            </div>
            <input
              value={form.name}
              onChange={(e) => setField("name")(e.target.value)}
              className={ctrl("name")}
              placeholder="VD: Paracetamol 500mg"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
            )}
          </label>

          {/* Đơn vị */}
          <SelectMenu<Unit>
            label="Đơn vị"
            required
            value={form.unit}
            onChange={(v) => setField("unit")((v as Unit) || form.unit)}
            options={unitOptions}
            invalid={!!errors.unit}
            error={errors.unit}
          />

          {/* Giá (text numeric để không rớt số 0 đầu khi nhập) */}
          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Giá (VNĐ)</span>
              <p className="text-red-500">*</p>
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={form.price.toString()}
              onChange={onChangePriceText}
              className={ctrl("price")}
              placeholder="VD: 15000"
            />
            {errors.price && (
              <p className="mt-1 text-xs text-rose-600">{errors.price}</p>
            )}
          </label>

          {/* Tồn kho */}
          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Tồn kho</span>
              <p className="text-red-500">*</p>
            </div>
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={onChangeStock}
              className={ctrl("stock")}
              placeholder="VD: 100"
            />
            {errors.stock && (
              <p className="mt-1 text-xs text-rose-600">{errors.stock}</p>
            )}
          </label>

          {/* Trạng thái (giữ value tiếng Anh, hiển thị TV). Sẽ được override khi lưu theo stock */}
          <SelectMenu<DrugStatus>
            label="Trạng thái"
            required
            value={form.status}
            onChange={(v) =>
              setField("status")((v as DrugStatus) || form.status)
            }
            options={statusOptions}
            invalid={!!errors.status}
            error={errors.status}
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
            disabled={loading || !isValid}
            className="cursor-pointer px-3 py-2 rounded-[var(--rounded)] bg-primary-linear text-white inline-flex items-center gap-2"
            title={!isValid ? "Vui lòng sửa các lỗi trước khi lưu" : "Lưu"}
          >
            <Save className="w-4 h-4" /> Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
