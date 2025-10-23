import { useEffect, useState } from "react";
import type {
  PatientPayload,
  PatientDetail,
} from "../../../services/patientsApi";
import {
  apiCreatePatient,
  apiGetPatient,
  apiUpdatePatient,
} from "../../../services/patientsApi";
import toast from "react-hot-toast";

// Định nghĩa GenderOpt phù hợp với backend
type GenderOpt = "M" | "F" | "O" | "";

export default function PatientModal({
  open,
  onClose,
  editingId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  editingId?: number | null;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<PatientPayload>({
    fullName: "",
    phone: "",
    gender: "",
    dateOfBirth: null,
    email: null,
    address: null,
    district: null,
    city: null,
    province: null,
    identityNo: null,
    insuranceNo: null,
    note: null,
    allergyText: null,
    patientCode: null,
  });

  // Reset form khi mở/đóng hoặc thay đổi editingId
  useEffect(() => {
    if (!open) return;

    if (!editingId) {
      setForm({
        fullName: "",
        phone: "",
        gender: "",
        dateOfBirth: null,
        email: null,
        address: null,
        district: null,
        city: null,
        province: null,
        identityNo: null,
        insuranceNo: null,
        note: null,
        allergyText: null,
        patientCode: null,
      });
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const p: PatientDetail = await apiGetPatient(editingId);

        setForm({
          fullName: p.fullName,
          phone: p.phone,
          gender: (p.gender ?? "") as GenderOpt, // null → ""
          dateOfBirth: p.dateOfBirth?.slice(0, 10) ?? null,
          email: p.email ?? null,
          address: p.address ?? null,
          district: p.district ?? null,
          city: p.city ?? null,
          province: p.province ?? null,
          identityNo: p.identityNo ?? null,
          insuranceNo: p.insuranceNo ?? null,
          note: p.note ?? null,
          allergyText: p.allergyText ?? null,
          patientCode: p.patientCode ?? null,
        });
      } catch {
        toast.error("Không tải được thông tin bệnh nhân");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, editingId]);

  // Hàm update an toàn
  const update = <K extends keyof PatientPayload>(
    key: K,
    value: PatientPayload[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Chuẩn hóa dữ liệu trước khi gửi
      const payload: PatientPayload = {
        ...form,
        // Đảm bảo các trường optional là null nếu rỗng
        email: form.email?.trim() === "" ? null : form.email?.trim() ?? null,
        address:
          form.address?.trim() === "" ? null : form.address?.trim() ?? null,
        district:
          form.district?.trim() === "" ? null : form.district?.trim() ?? null,
        city: form.city?.trim() === "" ? null : form.city?.trim() ?? null,
        province:
          form.province?.trim() === "" ? null : form.province?.trim() ?? null,
        identityNo:
          form.identityNo?.trim() === ""
            ? null
            : form.identityNo?.trim() ?? null,
        insuranceNo:
          form.insuranceNo?.trim() === ""
            ? null
            : form.insuranceNo?.trim() ?? null,
        note: form.note?.trim() === "" ? null : form.note?.trim() ?? null,
        allergyText:
          form.allergyText?.trim() === ""
            ? null
            : form.allergyText?.trim() ?? null,
        patientCode:
          form.patientCode?.trim() === ""
            ? null
            : form.patientCode?.trim() ?? null,
      };

      if (editingId) {
        await apiUpdatePatient(editingId, payload);
        toast.success("Cập nhật bệnh nhân thành công");
      } else {
        await apiCreatePatient(payload);
        toast.success("Thêm bệnh nhân thành công");
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Lưu bệnh nhân thất bại";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-3">
          {editingId ? "Sửa thông tin bệnh nhân" : "Thêm bệnh nhân"}
        </h3>

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {/* Họ tên */}
          <label className="space-y-1">
            <span>Họ tên *</span>
            <input
              className="input"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              required
              maxLength={100}
            />
          </label>

          {/* Số điện thoại */}
          <label className="space-y-1">
            <span>Số điện thoại *</span>
            <input
              className="input"
              value={form.phone}
              onChange={(e) =>
                update("phone", e.target.value.replace(/\D/g, ""))
              }
              required
              maxLength={15}
            />
          </label>

          {/* Giới tính */}
          <label className="space-y-1">
            <span>Giới tính</span>
            <select
              className="input"
              value={form.gender ?? ""}
              onChange={(e) => update("gender", e.target.value as GenderOpt)}
            >
              <option value="">- Chọn -</option>
              <option value="M">Nam</option>
              <option value="F">Nữ</option>
              <option value="O">Khác</option>
            </select>
          </label>

          {/* Ngày sinh */}
          <label className="space-y-1">
            <span>Ngày sinh</span>
            <input
              className="input"
              type="date"
              value={form.dateOfBirth ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                update("dateOfBirth", val === "" ? null : val);
              }}
            />
          </label>

          {/* Email */}
          <label className="space-y-1">
            <span>Email</span>
            <input
              className="input"
              type="email"
              value={form.email ?? ""}
              onChange={(e) => update("email", e.target.value)}
            />
          </label>

          {/* Địa chỉ */}
          <label className="space-y-1 sm:col-span-2">
            <span>Địa chỉ</span>
            <input
              className="input"
              value={form.address ?? ""}
              onChange={(e) => update("address", e.target.value)}
            />
          </label>

          {/* Quận/Huyện */}
          <label className="space-y-1">
            <span>Quận/Huyện</span>
            <input
              className="input"
              value={form.district ?? ""}
              onChange={(e) => update("district", e.target.value)}
            />
          </label>

          {/* Thành phố */}
          <label className="space-y-1">
            <span>Thành phố</span>
            <input
              className="input"
              value={form.city ?? ""}
              onChange={(e) => update("city", e.target.value)}
            />
          </label>

          {/* Tỉnh */}
          <label className="space-y-1 sm:col-span-2">
            <span>Tỉnh/Thành</span>
            <input
              className="input"
              value={form.province ?? ""}
              onChange={(e) => update("province", e.target.value)}
            />
          </label>

          {/* CMND/CCCD */}
          <label className="space-y-1">
            <span>CMND/CCCD</span>
            <input
              className="input"
              value={form.identityNo ?? ""}
              onChange={(e) =>
                update("identityNo", e.target.value.replace(/\D/g, ""))
              }
              maxLength={12}
            />
          </label>

          {/* Mã BHYT */}
          <label className="space-y-1">
            <span>Mã BHYT</span>
            <input
              className="input"
              value={form.insuranceNo ?? ""}
              onChange={(e) => update("insuranceNo", e.target.value)}
            />
          </label>

          {/* Ghi chú */}
          <label className="space-y-1 sm:col-span-2">
            <span>Ghi chú</span>
            <textarea
              className="input min-h-20"
              value={form.note ?? ""}
              onChange={(e) => update("note", e.target.value)}
            />
          </label>

          {/* Dị ứng */}
          <label className="space-y-1 sm:col-span-2">
            <span>Dị ứng</span>
            <textarea
              className="input min-h-20"
              value={form.allergyText ?? ""}
              onChange={(e) => update("allergyText", e.target.value)}
            />
          </label>

          {/* Nút hành động */}
          <div className="sm:col-span-2 flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer border rounded-lg px-4 py-2 hover:bg-gray-50"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer rounded-lg px-4 py-2 bg-primary-linear text-white disabled:opacity-70"
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
