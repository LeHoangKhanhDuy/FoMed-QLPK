// src/components/admin/users/UserManager.tsx
import { useEffect, useMemo, useState } from "react";
import { Search, Users, Power, ChevronLeft, ChevronRight } from "lucide-react";
import type { User, AdminRole, UserStatus } from "../../../types/user/user";
import { SelectMenu } from "../../ui/select-menu";
import { getAllUsers, setUserStatus } from "../../../services/userApi";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../../Utils/errorHepler";
import MaskedPhone from "../../../common/MaskedPhone";

type FilterRole = "all" | AdminRole;

export default function UserManager() {
  const [items, setItems] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [role, setRole] = useState<FilterRole>("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    // lần đầu load
    getAllUsers({ page: 1, limit: 100 }) // hoặc phân trang thật nếu muốn
      .then(({ items }) => setItems(items))
      .catch(() => setItems([]));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((u) => {
      const okRole = role === "all" ? true : u.roles.includes(role);
      const okQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.code.toLowerCase().includes(q) ||
        (u.phone ?? "").toLowerCase().includes(q) ||
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
      ? "bg-green-200 text-green-600"
      : "bg-red-200 text-red-600";

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

  const setStatus = async (id: number, next: UserStatus) => {
    setLoadingId(id);
    try {
      const isActive = next === "active";
      await setUserStatus(id, isActive);
      setItems((arr) =>
        arr.map((u) => (u.id === id ? { ...u, status: next } : u))
      );
      toast.success(
        isActive
          ? "Mở khoá tài khoản thành công!"
          : "Khoá tài khoản thành công!"
      );
    } catch (e: unknown) {
      toast.error(
        getErrorMessage(e, "❌ Lỗi khi cập nhật trạng thái tài khoản!")
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-xs border p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-sky-400" />
          <h2 className="font-bold">Quản lý người dùng</h2>
          <span className="text-sm text-slate-500">
            ({filtered.length} người)
          </span>
        </div>

        <div className="space-y-1 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-7.5 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên, mã, SĐT, email…"
              className="mt-1 block w-full rounded-[var(--rounded)] border bg-white/90 pl-9 pr-3 py-3 text-[16px] leading-6 text-left shadow-xs outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="w-full sm:w-56">
            <SelectMenu<FilterRole>
              value={role}
              onChange={(v) => setRole((v as FilterRole) || "all")}
              options={[
                { value: "all", label: "Tất cả vai trò" },
                { value: "ADMIN", label: "Quản trị" },
                { value: "DOCTOR", label: "Bác sĩ" },
                { value: "EMPLOYEE", label: "Nhân viên" },
                { value: "PATIENT", label: "Bệnh nhân" },
              ]}
              className="h-11"
            />
          </div>
        </div>
      </header>

      <div className="overflow-x-auto rounded-sm border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-sky-400 text-center text-white">
              <th className="px-3 py-2 text-left">#</th>
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
                <td className="px-3 py-2 text-left font-medium">
                  {(page - 1) * perPage + paged.indexOf(u) + 1}
                </td>
                <td className="px-3 py-2 text-left font-bold">{u.name}</td>
                <td className="px-3 py-2 align-middle">
                  <div className="w-full flex flex-wrap items-center justify-center gap-1">
                    {u.roles.map((r) => (
                      <span
                        key={r}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge(
                          r
                        )}`}
                      >
                        {roleLabel[r]}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <MaskedPhone phone={u.phone} />
                </td>
                <td className="px-3 py-2">{u.email ?? "-"}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(
                      u.status
                    )}`}
                  >
                    {u.status === "active" ? "Active" : "Block"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleString("vi-VN")
                    : "-"}
                </td>
                <td className="py-2 pr-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
                    <button
                      disabled={loadingId === u.id}
                      onClick={() =>
                        setStatus(
                          u.id,
                          u.status === "active" ? "inactive" : "active"
                        )
                      }
                      className={`cursor-pointer inline-flex items-center justify-center gap-1 rounded-[var(--rounded)] px-2 py-2 ${
                        u.status === "active"
                          ? "bg-warning-linear text-white"
                          : "bg-success-linear text-white"
                      }`}
                    >
                      <Power className="w-5 h-5" />
                      {loadingId === u.id ? "..." : u.status === "active"}
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
          Trang {Math.min(page, lastPage)} / {lastPage}
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
    </section>
  );
}
