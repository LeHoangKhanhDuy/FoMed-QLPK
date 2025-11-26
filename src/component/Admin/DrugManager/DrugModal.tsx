import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Save,
  X,
  Package,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { DrugItem } from "../../../types/drug/drug";
import { SelectMenu } from "../../ui/select-menu";
import {
  apiUpdateDrugInventory,
  apiGetDrugLots,
  apiCreateDrugLot,
  type DrugLot,
} from "../../../services/drugApi";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<DrugItem>;
  onSubmit: (
    payload: Omit<DrugItem, "id" | "createdAt" | "status" | "isActive">
  ) => Promise<void>;
  onInventoryUpdated?: () => void;
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

export default function DrugModal({
  open,
  onClose,
  initial,
  onSubmit,
  onInventoryUpdated,
}: Props) {
  /* --- STATE CHUNG --- */
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
  const isEditing = !!initial?.id;

  /* --- STATE INVENTORY --- */
  const [showInventory, setShowInventory] = useState(false);
  const [invLoading, setInvLoading] = useState(false);
  const [invType, setInvType] = useState<"in" | "out" | "adjust">("in");
  const [invQuantity, setInvQuantity] = useState<string>("");
  const [invUnitCost, setInvUnitCost] = useState<string>("");

  // Quản lý Lô (Lot)
  const [lots, setLots] = useState<DrugLot[]>([]);
  const [selectedLotId, setSelectedLotId] = useState<string | number | "">("");
  const [newLotNumber, setNewLotNumber] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [newExpiryText, setNewExpiryText] = useState("");

  /* --- CALENDAR STATE & LOGIC (ĐÃ FIX) --- */
  const [calOpenExpiry, setCalOpenExpiry] = useState(false);
  const [viewYearExpiry, setViewYearExpiry] = useState<number>(() =>
    new Date().getFullYear()
  );
  const [viewMonthExpiry, setViewMonthExpiry] = useState<number>(() =>
    new Date().getMonth()
  );

  // Hàm Helper Calendar
  const pad = (n: number) => n.toString().padStart(2, "0");

  const ymdToDmy = (ymd: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
    const [y, m, d] = ymd.split("-");
    return `${d}/${m}/${y}`;
  };

  const dmyToYmd = (dmy: string) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dmy)) return null;
    const [d, m, y] = dmy.split("/");
    return `${y}-${m}-${d}`;
  };

  // Logic tạo Grid ngày tháng
  const daysExpiry = useMemo(() => {
    const first = new Date(viewYearExpiry, viewMonthExpiry, 1);
    const last = new Date(viewYearExpiry, viewMonthExpiry + 1, 0);
    const startIdx = (first.getDay() + 6) % 7; // T2 là 0
    const total = last.getDate();
    const arr: Array<{ d: number; ymd: string }> = [];
    for (let i = 1; i <= total; i++) {
      const ymd = `${viewYearExpiry}-${pad(viewMonthExpiry + 1)}-${pad(i)}`;
      arr.push({ d: i, ymd });
    }
    return { startIdx, arr };
  }, [viewYearExpiry, viewMonthExpiry]);

  const isSelectedExpiry = (ymd: string) => newExpiry === ymd;

  // FIX: Logic chuyển tháng an toàn, không dùng lồng nhau
  const gotoPrevMonthExpiry = (e: React.MouseEvent) => {
    e.preventDefault(); // Chặn submit form
    e.stopPropagation();
    if (viewMonthExpiry === 0) {
      setViewMonthExpiry(11);
      setViewYearExpiry((y) => y - 1);
    } else {
      setViewMonthExpiry((m) => m - 1);
    }
  };

  const gotoNextMonthExpiry = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonthExpiry === 11) {
      setViewMonthExpiry(0);
      setViewYearExpiry((y) => y + 1);
    } else {
      setViewMonthExpiry((m) => m + 1);
    }
  };

  /* --- VALIDATORS & EFFECTS (Giữ nguyên) --- */
  const validateField = (field: Field, value: unknown): string => {
    const str = String(value);
    const num = Number(value);
    switch (field) {
      case "code":
        if (!str.trim()) return "Vui lòng nhập mã thuốc";
        if (!/^[A-Za-z0-9\-_]{2,32}$/.test(str))
          return "Mã 2–32 ký tự, chỉ chữ/số, -, _";
        return "";
      case "name":
        if (!str.trim()) return "Vui lòng nhập tên thuốc";
        return "";
      case "price":
        if (num < 0) return "Giá phải ≥ 0";
        return "";
      default:
        return "";
    }
  };

  const validateForm = useCallback(() => {
    const out: FieldErrors = {
      code: validateField("code", form.code),
      name: validateField("name", form.name),
      price: validateField("price", form.price),
    };
    Object.keys(out).forEach((k) => {
      if (!out[k as Field]) delete out[k as Field];
    });
    return out;
  }, [form]);

  const isValid = useMemo(
    () => Object.keys(validateForm()).length === 0,
    [validateForm]
  );

  useEffect(() => {
    if (open) {
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
      resetInventoryForm();
    }
  }, [open, initial]);

  useEffect(() => {
    if (showInventory && initial?.id) {
      apiGetDrugLots(initial.id)
        .then(setLots)
        .catch(() => toast.error("Lỗi tải lô"));
    }
  }, [showInventory, initial?.id]);

  /* --- HANDLERS --- */
  const resetInventoryForm = () => {
    setInvType("in");
    setInvQuantity("");
    setInvUnitCost("");
    setSelectedLotId("");
    setNewLotNumber("");
    setNewExpiry("");
    setNewExpiryText("");
    setCalOpenExpiry(false);
    setLots([]);
  };

  const handleInvTypeChange = (val: "in" | "out" | "adjust") => {
    setInvType(val);
    if (val === "out" && selectedLotId === "NEW") setSelectedLotId("");
  };

  const handleInventoryUpdate = async () => {
    if (!initial?.id) return;
    const qty = Number(invQuantity);
    if (!Number.isFinite(qty) || qty <= 0)
      return toast.error("Số lượng phải lớn hơn 0");
    if (!selectedLotId) return toast.error("Vui lòng chọn lô thuốc");
    if (invType === "in" && selectedLotId === "NEW" && !newLotNumber.trim())
      return toast.error("Vui lòng nhập số lô mới");

    setInvLoading(true);
    try {
      let finalLotId = 0;
      if (selectedLotId === "NEW") {
        const newLot = await apiCreateDrugLot(initial.id, {
          lotNumber: newLotNumber,
          expiryDate: newExpiry || null,
        });
        finalLotId = newLot.lotId;
      } else {
        finalLotId = Number(selectedLotId);
      }

      const realQty = invType === "out" ? -qty : qty;
      const unitCostVal = invUnitCost ? Number(invUnitCost) : undefined;

      const result = await apiUpdateDrugInventory(initial.id, {
        txnType: invType,
        quantity: realQty,
        lotId: finalLotId,
        unitCost: invType === "in" ? unitCostVal : undefined,
        refNote: `${
          invType === "in" ? "Nhập" : invType === "out" ? "Xuất" : "Điều chỉnh"
        } kho`,
      });

      toast.success(
        `Cập nhật thành công. Tồn mới: ${result.stock.toLocaleString("vi-VN")}`
      );
      setForm((f) => ({ ...f, stock: result.stock }));
      onInventoryUpdated?.();
      setShowInventory(false);
      resetInventoryForm();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Lỗi cập nhật";
      toast.error(msg);
    } finally {
      setInvLoading(false);
    }
  };

  const formatNumber = (num: number) => num.toLocaleString("vi-VN");
  const onChangePriceText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setForm((f) => ({ ...f, price: Number(raw) }));
  };

  const submit = async () => {
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        code: form.code,
        name: form.name,
        unit: form.unit,
        price: form.price,
        stock: form.stock,
      });
      onClose();
    } catch {
      toast.error("Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (err?: string) =>
    `mt-1 block w-full rounded-[var(--rounded)] border bg-white px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-sky-500 ${
      err ? "border-rose-400 focus:ring-rose-400" : ""
    }`;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* --- MODAL CHÍNH --- */}
      <div className="relative w-full max-w-2xl mx-3 sm:mx-0 bg-white rounded-xl shadow-lg p-5">
        {submitError && (
          <div className="mb-3 p-3 bg-rose-100 text-rose-600 text-sm rounded">
            {submitError}
          </div>
        )}

        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-xl uppercase text-slate-700">
            {initial?.id ? "Cập nhật thuốc" : "Thêm thuốc mới"}
          </h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Form Fields (Giữ nguyên) */}
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Mã thuốc <span className="text-red-500">*</span>
            </span>
            <input
              value={form.code}
              onChange={(e) => {
                setForm({ ...form, code: e.target.value });
                setErrors({ ...errors, code: undefined });
              }}
              className={inputClass(errors.code)}
              placeholder="VD: PARA500"
            />
            {errors.code && (
              <p className="text-xs text-rose-500 mt-1">{errors.code}</p>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Tên thuốc <span className="text-red-500">*</span>
            </span>
            <input
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                setErrors({ ...errors, name: undefined });
              }}
              className={inputClass(errors.name)}
              placeholder="VD: Paracetamol 500mg"
            />
            {errors.name && (
              <p className="text-xs text-rose-500 mt-1">{errors.name}</p>
            )}
          </label>

          <div className="relative z-20">
            <SelectMenu<Unit>
              label="Đơn vị"
              required
              value={form.unit}
              onChange={(v) => setForm({ ...form, unit: v as Unit })}
              options={UNIT_OPTIONS.map((u) => ({ value: u, label: u }))}
            />
          </div>

          <label className="block relative z-10">
            <span className="text-sm font-medium text-slate-700">
              Giá bán (VNĐ) <span className="text-red-500">*</span>
            </span>
            <input
              value={formatNumber(form.price)}
              onChange={onChangePriceText}
              className={inputClass(errors.price)}
              placeholder="VD: 10.000"
            />
            {errors.price && (
              <p className="text-xs text-rose-500 mt-1">{errors.price}</p>
            )}
          </label>

          {isEditing && (
            <div className="block sm:col-span-2 bg-slate-50 p-3 rounded border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Tồn kho hiện tại
                </span>
                <button
                  type="button"
                  onClick={() => setShowInventory(true)}
                  className="text-xs bg-primary-linear text-white px-3 py-1.5 rounded-[var(--rounded)] transition-colors shadow-sm cursor-pointer"
                >
                  Nhập / Xuất kho
                </button>
              </div>
              <div className="text-2xl font-bold text-green-500">
                {formatNumber(form.stock)}{" "}
                <span className="text-sm font-normal text-slate-500">
                  {form.unit}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-[var(--rounded)] cursor-pointer"
          >
            Huỷ bỏ
          </button>
          <button
            onClick={submit}
            disabled={loading || !isValid}
            className="px-4 py-2 bg-primary-linear text-white rounded-[var(--rounded)] shadow-sm flex items-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              "Đang lưu..."
            ) : (
              <>
                <Save className="w-4 h-4" /> Lưu thông tin
              </>
            )}
          </button>
        </div>
      </div>

      {/* --- MODAL INVENTORY --- */}
      {showInventory && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-6 mx-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h4 className="font-bold text-lg text-slate-800">
                Điều chỉnh tồn kho
              </h4>
              <button
                onClick={() => setShowInventory(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => handleInvTypeChange("in")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                    invType === "in"
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  + Nhập kho
                </button>
                <button
                  onClick={() => handleInvTypeChange("out")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                    invType === "out"
                      ? "bg-white text-rose-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  - Xuất kho
                </button>
                <button
                  onClick={() => handleInvTypeChange("adjust")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                    invType === "adjust"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Điều chỉnh
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Chọn Lô thuốc <span className="text-red-500">*</span>
                </label>
                <SelectMenu<number | string>
                  value={selectedLotId as number | string}
                  onChange={(v) => setSelectedLotId(v as number | string)}
                  options={[
                    ...lots.map((lot) => ({
                      value: lot.lotId,
                      label: `${lot.lotNumber} (HSD: ${
                        lot.expiryDate
                          ? new Date(lot.expiryDate).toLocaleDateString("vi-VN")
                          : "N/A"
                      }) - Tồn: ${lot.quantity}`,
                    })),
                    ...(invType === "in"
                      ? [{ value: "NEW", label: "+ Tạo lô mới..." }]
                      : []),
                  ]}
                  placeholder="-- Chọn lô --"
                  className="w-full relative z-20" // z-index cao cho dropdown
                />
              </div>

              {selectedLotId === "NEW" && invType === "in" && (
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">
                        Số lô (Batch No)
                      </label>
                      <input
                        value={newLotNumber}
                        onChange={(e) => setNewLotNumber(e.target.value)}
                        className="w-full text-sm border border-blue-200 rounded p-1.5 focus:border-blue-400 outline-none"
                        placeholder="VD: LOT2603"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">
                        Hạn sử dụng
                      </label>
                      <div className="relative">
                        <div className="mt-1 flex gap-2">
                          <input
                            value={newExpiryText}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, "");
                              const digits = raw.slice(0, 8);
                              const formatDmy = (d: string) => {
                                if (d.length <= 2)
                                  return d + (d.length === 2 ? "/" : "");
                                if (d.length <= 4)
                                  return (
                                    d.slice(0, 2) +
                                    "/" +
                                    d.slice(2) +
                                    (d.length === 4 ? "/" : "")
                                  );
                                return (
                                  d.slice(0, 2) +
                                  "/" +
                                  d.slice(2, 4) +
                                  "/" +
                                  d.slice(4)
                                );
                              };
                              const formatted = formatDmy(digits);
                              setNewExpiryText(formatted);
                              if (digits.length === 8) {
                                const ymd = dmyToYmd(formatted);
                                if (ymd) {
                                  setNewExpiry(ymd);
                                  const dt = new Date(ymd);
                                  setViewYearExpiry(dt.getFullYear());
                                  setViewMonthExpiry(dt.getMonth());
                                }
                              } else {
                                setNewExpiry("");
                              }
                            }}
                            placeholder="dd/mm/yyyy"
                            className="w-full text-sm border border-blue-200 rounded p-1.5 focus:border-blue-400 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setCalOpenExpiry((s) => !s)}
                            className="px-2 rounded border hover:bg-gray-50 inline-flex items-center"
                          >
                            <CalendarDays className="w-4 h-4 text-sky-500" />
                          </button>
                        </div>

                        {/* --- CALENDAR POPUP (FIXED) --- */}
                        {calOpenExpiry && (
                          <div className="absolute top-full mt-1 right-0 z-50 w-[280px] rounded-xl border bg-white shadow-2xl p-3">
                            <div className="flex items-center justify-between mb-2">
                              <button
                                type="button"
                                onClick={gotoPrevMonthExpiry}
                                className="p-1 hover:bg-slate-100 rounded"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>

                              {/* Năm + Tháng Header */}
                              <div className="flex items-center gap-1 font-medium text-sm">
                                <span>Tháng {pad(viewMonthExpiry + 1)} / </span>
                                {/* Dropdown chọn năm nhanh */}
                                <select
                                  value={viewYearExpiry}
                                  onChange={(e) =>
                                    setViewYearExpiry(Number(e.target.value))
                                  }
                                  className="border-none bg-transparent outline-none cursor-pointer font-bold hover:text-sky-600"
                                >
                                  {Array.from(
                                    { length: 10 },
                                    (_, i) => new Date().getFullYear() - 2 + i
                                  ).map((y) => (
                                    <option key={y} value={y}>
                                      {y}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <button
                                type="button"
                                onClick={gotoNextMonthExpiry}
                                className="p-1 hover:bg-slate-100 rounded"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-7 text-center text-xs text-slate-500 mb-1">
                              <div>T2</div>
                              <div>T3</div>
                              <div>T4</div>
                              <div>T5</div>
                              <div>T6</div>
                              <div>T7</div>
                              <div>CN</div>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {Array.from({ length: daysExpiry.startIdx }).map(
                                (_, i) => (
                                  <div key={`e-${i}`} />
                                )
                              )}
                              {daysExpiry.arr.map(({ d, ymd }) => (
                                <button
                                  key={ymd}
                                  type="button"
                                  onClick={() => {
                                    setNewExpiry(ymd);
                                    setNewExpiryText(ymdToDmy(ymd));
                                    setCalOpenExpiry(false);
                                  }}
                                  className={`h-7 rounded text-xs hover:bg-slate-100 ${
                                    isSelectedExpiry(ymd)
                                      ? "bg-sky-500 text-white"
                                      : ""
                                  }`}
                                >
                                  {d}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* -------------------------- */}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Số lượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={invQuantity}
                    onChange={(e) => setInvQuantity(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2.5 text-sm font-bold text-slate-800 outline-none"
                    placeholder="0"
                  />
                </div>
                {invType === "in" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Giá nhập (đ)
                    </label>
                    <input
                      type="text"
                      value={
                        invUnitCost ? formatNumber(Number(invUnitCost)) : ""
                      }
                      onChange={(e) =>
                        setInvUnitCost(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full border border-slate-300 rounded-md p-2.5 text-sm outline-none"
                      placeholder="VD: 5.000"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-2 border-t">
                <button
                  onClick={() => setShowInventory(false)}
                  className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-[var(--rounded)] cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleInventoryUpdate}
                  disabled={invLoading || !invQuantity || !selectedLotId}
                  className={`px-4 py-2 text-sm text-white rounded-[var(--rounded)] bg-primary-linear shadow-sm flex items-center gap-2 cursor-pointer`}
                >
                  {invLoading ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
