import { useEffect, useMemo, useState } from "react";
import { Save, X, Package } from "lucide-react";
import type { DrugItem } from "../../../types/drug/drug";
import { SelectMenu, type SelectOption } from "../../ui/select-menu";
import { apiUpdateDrugInventory } from "../../../services/drugApi";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<DrugItem>;
  onSubmit: (
    payload: Omit<DrugItem, "id" | "createdAt" | "status" | "isActive">
  ) => Promise<void>;
  onInventoryUpdated?: () => void; // Callback để refresh danh sách sau khi cập nhật tồn kho
};

const UNIT_OPTIONS = ["viên", "gói", "ống", "chai", "vỉ", "ml", "hộp"] as const;
type Unit = (typeof UNIT_OPTIONS)[number];

const normalizeUnit = (u?: string): Unit =>
  UNIT_OPTIONS.includes(u as Unit) ? (u as Unit) : "viên";

type DrugForm = Omit<
  DrugItem,
  "id" | "createdAt" | "unit" | "status" | "isActive"
> & { unit: Unit };

type Field = "code" | "name" | "unit" | "price" | "stock";
type FieldErrors = Partial<Record<Field, string>>;

export default function DrugModal({ open, onClose, initial, onSubmit, onInventoryUpdated }: Props) {
  const [form, setForm] = useState<DrugForm>({
    code: initial?.code ?? "",
    name: initial?.name ?? "",
    unit: normalizeUnit(initial?.unit),
    price: initial?.price ?? 0,
    stock: initial?.stock ?? 0,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // State cho modal cập nhật tồn kho
  const [showInventory, setShowInventory] = useState(false);
  const [invQuantity, setInvQuantity] = useState<string>("");
  const [invType, setInvType] = useState<"in" | "out" | "adjust">("in");
  const [invLoading, setInvLoading] = useState(false);
  
  const isEditing = !!initial?.id;

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

  // Options cho loại giao dịch tồn kho
  const inventoryTypeOptions: SelectOption<"in" | "out" | "adjust">[] = [
    { value: "in", label: "Nhập kho (in)" },
    { value: "out", label: "Xuất kho (out)" },
    { value: "adjust", label: "Điều chỉnh (adjust)" },
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
    });
    setErrors({});
    setSubmitError(null);
    setShowInventory(false);
    setInvQuantity("");
    setInvType("in");
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

  // Format số thành chuỗi có dấu phẩy ngăn cách hàng nghìn
  const formatNumber = (num: number): string => {
    return num.toLocaleString("vi-VN");
  };

  const onChangePriceText: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const raw = e.target.value.replace(/\D/g, ""); // chỉ giữ số
    const n = raw === "" ? 0 : Number(raw);
    setField("price")(n);
  };

  // Handler cập nhật tồn kho
  const handleInventoryUpdate = async () => {
    if (!initial?.id) return;
    
    const qty = Number(invQuantity);
    if (!Number.isFinite(qty) || qty === 0) {
      toast.error("Số lượng không hợp lệ");
      return;
    }

    setInvLoading(true);
    try {
      const result = await apiUpdateDrugInventory(initial.id, {
        txnType: invType,
        quantity: invType === "out" ? -Math.abs(qty) : qty,
        refNote: `${invType === "in" ? "Nhập" : invType === "out" ? "Xuất" : "Điều chỉnh"} kho`,
      });

      toast.success(`Đã cập nhật tồn kho: ${result.stock.toLocaleString("vi-VN")}`);
      
      // Cập nhật stock trong form
      setForm((f) => ({ ...f, stock: result.stock }));
      setShowInventory(false);
      setInvQuantity("");
      
      // Gọi callback để refresh danh sách bên ngoài
      onInventoryUpdated?.();
    } catch {
      toast.error("Cập nhật tồn kho thất bại");
    } finally {
      setInvLoading(false);
    }
  };

  const submit = async () => {
    const errs = validateForm();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      // Hiển thị thông báo lỗi tổng quát
      setSubmitError("Vui lòng điền đầy đủ và chính xác các trường bắt buộc!");
      return;
    }

    const payload: Omit<DrugItem, "id" | "createdAt" | "status" | "isActive"> =
      {
        code: form.code,
        name: form.name,
        unit: form.unit,
        price: form.price,
        stock: form.stock,
      };

    setLoading(true);
    try {
      await onSubmit(payload);
      onClose();
    } catch {
      setErrors((e) => ({ ...e, code: e.code ?? "Không lưu được thuốc" }));
    } finally {
      setLoading(false);
    }
  };

  // FIX: className string bị chèn `"+ "` dư thừa
  const ctrl = (field: Field) =>
    `mt-1 block w-full rounded-[var(--rounded)] border bg-white/90 px-4 py-3 text-[16px] leading-6 shadow-xs outline-none focus:ring-2 focus:ring-sky-500 ${
      errors[field] ? "border-rose-400 focus:ring-rose-400" : ""
    }`;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-3 sm:mx-0 bg-white rounded-xl shadow-lg p-5">
        {/* Thông báo lỗi tổng quát */}
        {submitError && (
          <div className="mb-3 p-3 bg-rose-100 text-rose-600 text-sm rounded-[var(--rounded)]">
            {submitError}
          </div>
        )}

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

          {/* Giá */}
          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Giá (VNĐ)</span>
              <p className="text-red-500">*</p>
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={formatNumber(form.price)}
              onChange={onChangePriceText}
              className={ctrl("price")}
              placeholder="VD: 15.000"
            />
            {errors.price && (
              <p className="mt-1 text-xs text-rose-600">{errors.price}</p>
            )}
          </label>

          {/* Tồn kho - READ ONLY khi edit, ẩn khi create */}
          {isEditing && (
            <label className="text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="block mb-1 text-slate-600">Tồn kho hiện tại</span>
                <button
                  type="button"
                  onClick={() => setShowInventory(true)}
                  className="text-xs px-2 py-1 rounded bg-sky-50 text-sky-600 hover:bg-sky-100 cursor-pointer flex items-center gap-1"
                >
                  <Package className="w-3 h-3" />
                  Cập nhật
                </button>
              </div>
              <input
                type="text"
                value={formatNumber(form.stock)}
                readOnly
                className="mt-1 block w-full rounded-[var(--rounded)] border bg-slate-50 px-4 py-3 text-[16px] leading-6 shadow-xs cursor-not-allowed text-slate-500"
              />
              <p className="mt-1 text-xs text-slate-500">
                💡 Tồn kho tính từ giao dịch nhập/xuất. Nhấn "Cập nhật" để điều chỉnh.
              </p>
            </label>
          )}
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
            className={`cursor-pointer px-3 py-2 rounded-[var(--rounded)] bg-primary-linear text-white inline-flex items-center gap-2 ${
              loading || !isValid ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title={!isValid ? "Vui lòng sửa các lỗi trước khi lưu" : "Lưu"}
          >
            <Save className="w-4 h-4" /> Lưu
          </button>
        </div>
      </div>

      {/* Modal cập nhật tồn kho */}
      {showInventory && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowInventory(false)} />
          <div className="relative w-full max-w-md mx-3 bg-white rounded-lg shadow-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-lg">Cập nhật tồn kho</h4>
              <button
                onClick={() => setShowInventory(false)}
                className="cursor-pointer p-1 rounded hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Loại giao dịch */}
              <SelectMenu<"in" | "out" | "adjust">
                label="Loại giao dịch"
                required
                value={invType}
                onChange={(v) => setInvType(v as "in" | "out" | "adjust")}
                options={inventoryTypeOptions}
              />

              {/* Số lượng */}
              <label className="text-sm mt-2">
                <div className="flex items-center gap-2">
                  <span className="block mb-1 text-slate-600">Số lượng</span>
                  <p className="text-red-500">*</p>
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  value={invQuantity}
                  onChange={(e) => setInvQuantity(e.target.value)}
                  className="mt-1 block w-full rounded-[var(--rounded)] border bg-white px-4 py-3 text-[16px] shadow-xs outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="VD: 100"
                />
              </label>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowInventory(false)}
                className="cursor-pointer px-3 py-2 rounded-[var(--rounded)] border hover:bg-gray-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleInventoryUpdate}
                disabled={invLoading || !invQuantity}
                className={`cursor-pointer px-3 py-2 rounded-[var(--rounded)] bg-primary-linear text-white ${
                  invLoading || !invQuantity ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {invLoading ? "Đang lưu..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
