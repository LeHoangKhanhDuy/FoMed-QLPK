import { useEffect, useMemo, useState } from "react";
import { Search, Users, Pencil,  KeyRound, Power, ChevronLeft, ChevronRight } from "lucide-react";
import type { User, UserRole, UserStatus } from "../../../types/user/user";
import { apiCreateUser, apiListUsers, apiToggleStatus, apiUpdateUser } from "../../../types/user/mockUserApi";
import UserModal from "./UserModal";
import { SelectMenu } from "../../ui/select-menu";


type FilterRole = "all" | UserRole;

export default function UserManager() {
  const [items, setItems] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<FilterRole>("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  useEffect(() => {
    apiListUsers().then(setItems);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((u) => {
      const okRole = role === "all" ? true : u.role === role;
      const okQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.code.toLowerCase().includes(q) ||
        (u.phone ?? "").includes(q) ||
        (u.email ?? "").toLowerCase().includes(q);
      return okRole && okQuery;
    });
  }, [items, query, role]);

  const lastPage = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  useEffect(() => {
    if (page > lastPage) setPage(1);
  }, [lastPage, page]);

  const statusBadge = (s: UserStatus) =>
    s === "active"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-slate-200 text-slate-600";

  const roleLabel: Record<UserRole, string> = {
    patient: "Bệnh nhân",
    staff: "Nhân viên",
    doctor: "Bác sĩ",
    admin: "Quản trị",
  };

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setOpen(true);
  };

  const submit = async (payload: Omit<User, "id" | "createdAt">) => {
    if (editing) {
      const upd = await apiUpdateUser(editing.id, payload);
      setItems((arr) => arr.map((u) => (u.id === upd.id ? upd : u)));
    } else {
      const created = await apiCreateUser(payload);
      setItems((arr) => [created, ...arr]);
    }
  };

  const setStatus = async (id: number, s: UserStatus) => {
    const upd = await apiToggleStatus(id, s);
    setItems((arr) => arr.map((u) => (u.id === id ? upd : u)));
  };

//   const resetPassword = async (id: number) => {
//     await apiResetPassword(id);
//     alert("Đã reset mật khẩu (mock).");
//   };

  return (
    <section className="bg-white rounded-xl shadow-xs border p-4 sm:p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-sky-400" />
          <h2 className="font-bold">Quản lý người dùng</h2>
          <span className="text-sm text-slate-500">
            ({filtered.length} người)
          </span>
        </div>

        <div className="space-y-1 flex flex-col sm:flex-row gap-2 w-full sm:w-auto ">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-7.5 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên, mã, SĐT, email…"
              className="mt-1 block w-full rounded-[var(--rounded)] border bg-white/90 pl-9 pr-3 py-3 text-[16px] leading-6 text-left shadow-xs outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Select */}
          <div className="w-full sm:w-48">
            <SelectMenu<FilterRole>
              value={role}
              onChange={(v) => setRole((v as FilterRole) || "all")}
              options={[
                { value: "all", label: "Tất cả vai trò" },
                { value: "patient", label: "Bệnh nhân" },
                { value: "staff", label: "Nhân viên" },
                { value: "doctor", label: "Bác sĩ" },
                { value: "admin", label: "Quản trị" },
              ]}
              className="h-11"
            />
          </div>

          {/* Button */}
          <button
            onClick={openCreate}
            className="mt-1 cursor-pointer h-12 rounded-[var(--rounded)] bg-primary-linear text-white px-4 text-sm font-medium"
          >
            + Thêm người dùng
          </button>
        </div>
      </header>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-sky-400 text-white">
              <th className="px-3 py-2 text-left">Mã</th>
              <th className="px-3 py-2 text-left">Họ tên</th>
              <th className="px-3 py-2">Vai trò</th>
              <th className="px-3 py-2">SĐT</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2">Tạo lúc</th>
              <th className="px-3 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-500">
                  Chưa có người dùng.
                </td>
              </tr>
            )}

            {paged.map((u) => (
              <tr key={u.id} className="text-center border-b last:border-none">
                <td className="px-3 py-2 text-left font-medium">{u.code}</td>
                <td className="px-3 py-2 text-left font-bold">{u.name}</td>
                <td className="px-3 py-2">{roleLabel[u.role]}</td>
                <td className="px-3 py-2">{u.phone ?? "-"}</td>
                <td className="px-3 py-2">{u.email ?? "-"}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(
                      u.status
                    )}`}
                  >
                    {u.status === "active" ? "Đang hoạt động" : "Tạm khoá"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {new Date(u.createdAt).toLocaleString("vi-VN")}
                </td>
                <td className="py-2 pr-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEdit(u)}
                      className="cursor-pointer inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:bg-gray-50"
                      title="Sửa thông tin"
                    >
                      <Pencil className="w-4 h-4" /> Sửa
                    </button>

                    <button
                      className="cursor-pointer inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:bg-gray-50"
                      title="Reset mật khẩu"
                    >
                      <KeyRound className="w-4 h-4" /> Reset
                    </button>

                    <button
                      onClick={() =>
                        setStatus(
                          u.id,
                          u.status === "active" ? "inactive" : "active"
                        )
                      }
                      className={`cursor-pointer inline-flex items-center gap-1 rounded-md px-2 py-1 ${
                        u.status === "active"
                          ? "bg-red-100 text-red-700 hover:bg-rose-100"
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      }`}
                      title={
                        u.status === "active"
                          ? "Khoá tài khoản"
                          : "Mở khoá tài khoản"
                      }
                    >
                      <Power className="w-4 h-4" />
                      {u.status === "active" ? "Khoá" : "Mở"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Trang {Math.min(page, lastPage)} - {lastPage}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="cursor-pointer px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => setPage(Math.min(lastPage, page + 1))}
            disabled={page === lastPage}
            className="cursor-pointer px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Modal */}
      <UserModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing ?? undefined}
        onSubmit={async (payload) => {
          await submit(payload);
        }}
      />
    </section>
  );
}
