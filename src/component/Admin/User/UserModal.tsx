// import { useEffect, useState } from "react";

// import { Save, X } from "lucide-react";
// import type { User, UserRole, UserStatus } from "../../../types/user/user";
// import { SelectMenu, type SelectOption } from "../../ui/select-menu";

// type Props = {
//   open: boolean;
//   onClose: () => void;
//   initial?: Partial<User>;
//   onSubmit: (payload: Omit<User, "id" | "createdAt">) => Promise<void>;
// };

// const roleOptions: SelectOption<UserRole>[] = [
//   { value: "patient", label: "Bệnh nhân" },
//   { value: "staff", label: "Nhân viên" },
//   { value: "doctor", label: "Bác sĩ" },
//   { value: "admin", label: "Quản trị viên" },
// ];

// const statusOptions: SelectOption<UserStatus>[] = [
//   { value: "active", label: "Đang hoạt động" },
//   { value: "inactive", label: "Tạm khoá" },
// ];

// export default function UserModal({ open, onClose, initial, onSubmit }: Props) {
//   const [form, setForm] = useState<Omit<User, "id" | "createdAt">>({
//     code: initial?.code ?? "",
//     name: initial?.name ?? "",
//     phone: initial?.phone ?? "",
//     email: initial?.email ?? "",
//     role: (initial?.role as UserRole) ?? "patient",
//     status: (initial?.status as UserStatus) ?? "active",
//   });
//   const [err, setErr] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!open) return;
//     setForm({
//       code: initial?.code ?? "",
//       name: initial?.name ?? "",
//       phone: initial?.phone ?? "",
//       email: initial?.email ?? "",
//       role: (initial?.role as UserRole) ?? "patient",
//       status: (initial?.status as UserStatus) ?? "active",
//     });
//     setErr(null);
//   }, [open, initial]);

//   const submit = async () => {
//     if (!form.code.trim() || !form.name.trim()) {
//       setErr("Vui lòng nhập mã và họ tên");
//       return;
//     }
//     setLoading(true);
//     try {
//       await onSubmit(form);
//       onClose();
//     } catch (e) {
//       console.error(e);
//       setErr("Không lưu được người dùng");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div className="absolute inset-0 bg-black/40" onClick={onClose} />
//       <div className="relative w-full max-w-lg mx-3 bg-white rounded-xl shadow-lg p-5">
//         <div className="flex items-center justify-between mb-3">
//           <h3 className="font-semibold text-xl uppercase">
//             {initial?.id ? "Sửa người dùng" : "Thêm người dùng"}
//           </h3>
//           <button
//             onClick={onClose}
//             className="cursor-pointer p-2 rounded-md hover:bg-slate-100"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {err && <p className="mb-3 text-sm text-rose-600">{err}</p>}

//         <div className="grid grid-cols-2 gap-3">
//           <label className="text-sm">
//             <div className="flex items-center gap-1">
//               <span className="block mb-1 text-slate-600">Mã</span>
//               <span className="text-red-500">*</span>
//             </div>
//             <input
//               value={form.code}
//               onChange={(e) => setForm({ ...form, code: e.target.value })}
//               className="w-full rounded-[var(--rounded)] shadow-xs border px-3 py-3 outline-none focus:ring-2 focus:ring-sky-500"
//               placeholder="VD: BN001"
//             />
//           </label>
//           <label className="text-sm">
//             <div className="flex items-center gap-1">
//               <span className="block mb-1 text-slate-600">Họ tên</span>
//               <span className="text-red-500">*</span>
//             </div>
//             <input
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               className="w-full rounded-[var(--rounded)] shadow-xs border px-3 py-3 outline-none focus:ring-2 focus:ring-sky-500"
//               placeholder="VD: Nguyễn Văn A"
//             />
//           </label>
//           <label className="text-sm">
//             <div className="flex items-center gap-1">
//               <span className="block mb-1 text-slate-600">SĐT</span>
//               <span className="text-red-500">*</span>
//             </div>
//             <input
//               value={form.phone ?? ""}
//               onChange={(e) => setForm({ ...form, phone: e.target.value })}
//               className="w-full rounded-[var(--rounded)] shadow-xs border px-3 py-3 outline-none focus:ring-2 focus:ring-sky-500"
//               placeholder="VD: 0123456789"
//             />
//           </label>
//           <label className="text-sm">
//             <div className="flex items-center gap-1">
//               <span className="block mb-1 text-slate-600">Email</span>
//               <span className="text-red-500">*</span>
//             </div>
//             <input
//               type="email"
//               value={form.email ?? ""}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               className="w-full rounded-[var(--rounded)] shadow-xs border px-3 py-3 outline-none focus:ring-2 focus:ring-sky-500"
//               placeholder="VD: abc@gmail.com"
//             />
//           </label>
//           <SelectMenu<UserRole>
//             label="Vai trò"
//             required
//             value={form.role}
//             onChange={(v) =>
//               setForm((f) => ({ ...f, role: (v as UserRole) || f.role }))
//             }
//             options={roleOptions}
//           />
//           <SelectMenu<UserStatus>
//             label="Trạng thái"
//             required
//             value={form.status}
//             onChange={(v) =>
//               setForm((f) => ({ ...f, status: (v as UserStatus) || f.status }))
//             }
//             options={statusOptions}
//           />
//         </div>

//         <div className="mt-5 flex items-center justify-end gap-2">
//           <button
//             onClick={onClose}
//             className="cursor-pointer px-3 py-2 rounded-[var(--rounded)] border hover:bg-gray-50"
//           >
//             Huỷ
//           </button>
//           <button
//             onClick={submit}
//             disabled={loading}
//             className="cursor-pointer px-3 py-2 rounded-[var(--rounded)] bg-primary-linear text-white inline-flex items-center gap-2"
//           >
//             <Save className="w-4 h-4" /> Lưu
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
