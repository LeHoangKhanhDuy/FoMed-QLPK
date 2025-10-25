import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import type { User, AdminRole } from "../../../types/user/user";
import toast from "react-hot-toast";
import { updateUserRoles } from "../../../services/userApi";
import { getErrorMessage } from "../../../Utils/errorHepler";

type Props = {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: (userId: number, newRoles: AdminRole[]) => void;
};

const roleLabel: Record<AdminRole, string> = {
  ADMIN: "Quản trị viên",
  DOCTOR: "Bác sĩ",
  EMPLOYEE: "Nhân viên",
  PATIENT: "Bệnh nhân",
};

const roleBadge = (r: AdminRole) => {
  switch (r) {
    case "ADMIN":
      return "bg-sky-100 text-sky-700";
    case "DOCTOR":
      return "bg-violet-100 text-violet-700";
    case "EMPLOYEE":
      return "bg-amber-100 text-amber-700";
    case "PATIENT":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function EditRoleModal({ open, onClose, user, onSuccess }: Props) {
  const [selectedRole, setSelectedRole] = useState<AdminRole>("PATIENT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    // Lấy role đầu tiên nếu user có nhiều roles
    setSelectedRole(user.roles[0] || "PATIENT");
    setErr(null);
  }, [open, user]);

  const handleRoleChange = (role: AdminRole) => {
    setSelectedRole(role);
    setErr(null);
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!selectedRole) {
      setErr("Vui lòng chọn một vai trò!");
      return;
    }

    setIsSubmitting(true);
    setErr(null);
    try {
      // Gửi role dưới dạng array (chỉ có 1 phần tử)
      await updateUserRoles(user.id, [selectedRole]);
      toast.success("Cập nhật vai trò thành công!");
      onSuccess(user.id, [selectedRole]);
      onClose();
    } catch (e: unknown) {
      const errorMsg = getErrorMessage(e, "Không thể cập nhật vai trò");
      setErr(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-3 bg-white rounded-xl shadow-lg p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-xl uppercase">
            Chỉnh sửa vai trò
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer p-2 rounded-md hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {err && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{err}</p>
          </div>
        )}

        {/* User Info */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Người dùng</p>
          <p className="font-bold text-gray-800">{user.name}</p>
          {user.email && <p className="text-sm text-gray-600">{user.email}</p>}
          {user.phone && <p className="text-sm text-gray-600">{user.phone}</p>}
        </div>

        {/* Role Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Chọn vai trò <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {(["ADMIN", "DOCTOR", "EMPLOYEE", "PATIENT"] as AdminRole[]).map(
              (roleOption) => {
                const isSelected = selectedRole === roleOption;
                return (
                  <label
                    key={roleOption}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "border-sky-500 bg-sky-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      checked={isSelected}
                      onChange={() => handleRoleChange(roleOption)}
                      disabled={isSubmitting}
                      className="w-5 h-5 text-sky-600 focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${roleBadge(
                          roleOption
                        )}`}
                      >
                        {roleLabel[roleOption]}
                      </span>
                    </div>
                  </label>
                );
              }
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Chỉ được chọn một vai trò
          </p>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer px-4 py-2 rounded-[var(--rounded)] border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedRole}
            className="cursor-pointer px-4 py-2 rounded-[var(--rounded)] bg-primary-linear text-white inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

