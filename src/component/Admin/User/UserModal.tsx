import { useEffect, useState } from "react";

import { Save, X } from "lucide-react";
import type { User, UserRole, UserStatus } from "../../../types/user/user";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<User>;
  onSubmit: (payload: Omit<User, "id" | "createdAt">) => Promise<void>;
};

const roles: Array<{ v: UserRole; label: string }> = [
  { v: "patient", label: "Bệnh nhân" },
  { v: "staff", label: "Nhân viên" },
  { v: "doctor", label: "Bác sĩ" },
  { v: "admin", label: "Quản trị" },
];

export default function UserModal({ open, onClose, initial, onSubmit }: Props) {
  const [form, setForm] = useState<Omit<User, "id" | "createdAt">>({
    code: initial?.code ?? "",
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    role: (initial?.role as UserRole) ?? "patient",
    status: (initial?.status as UserStatus) ?? "active",
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      code: initial?.code ?? "",
      name: initial?.name ?? "",
      phone: initial?.phone ?? "",
      email: initial?.email ?? "",
      role: (initial?.role as UserRole) ?? "patient",
      status: (initial?.status as UserStatus) ?? "active",
    });
    setErr(null);
  }, [open, initial]);

  const submit = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      setErr("Vui lòng nhập mã và họ tên");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (e) {
      console.error(e);
      setErr("Không lưu được người dùng");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">
            {initial?.id ? "Sửa người dùng" : "Thêm người dùng"}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {err && <p className="mb-3 text-sm text-rose-600">{err}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Mã</span>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Họ tên</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-slate-600">SĐT</span>
            <input
              value={form.phone ?? ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Email</span>
            <input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Vai trò</span>
            <select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as UserRole })
              }
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
            >
              {roles.map((r) => (
                <option key={r.v} value={r.v}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Trạng thái</span>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as UserStatus })
              }
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Tạm khoá</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="cursor-pointer px-3 py-2 rounded-md border hover:bg-gray-50"
          >
            Huỷ
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="cursor-pointer px-3 py-2 rounded-md bg-primary-linear text-white disabled:opacity-60 inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
