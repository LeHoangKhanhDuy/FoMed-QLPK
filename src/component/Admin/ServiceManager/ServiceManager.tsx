import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ClipboardList,
  Pencil,
  Trash2,
  Power,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type {
  ServiceItem,
  ServiceKind,
  ServiceStatus,
} from "../../../types/serviceapi/service";
import {
  apiCreateService,
  apiDeleteService,
  apiListServices,
  apiToggleService,
  apiUpdateService,
} from "../../../types/serviceapi/mockServiceApi";
import ServiceModal from "./ServiceModal";
import ConfirmModal from "../../../common/ConfirmModal";
import { SelectMenu } from "../../ui/select-menu";

type FilterKind = "all" | ServiceKind;

export default function ServiceManager() {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<FilterKind>("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    apiListServices().then(setItems);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((s) => {
      const okKind = kind === "all" ? true : s.kind === kind;
      const okQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.department ?? "").toLowerCase().includes(q);
      return okKind && okQuery;
    });
  }, [items, query, kind]);

  const last = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  useEffect(() => {
    if (page > last) setPage(1);
  }, [last, page]);

  const badge = (s: ServiceStatus) =>
    s === "active"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-slate-200 text-slate-600";

  const kindLabel: Record<ServiceKind, string> = {
    exam: "Khám",
    lab: "Xét nghiệm",
    imaging: "CĐHA",
    procedure: "Thủ thuật",
  };

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (it: ServiceItem) => {
    setEditing(it);
    setOpen(true);
  };

  const submit = async (payload: Omit<ServiceItem, "id" | "createdAt">) => {
    if (editing) {
      const upd = await apiUpdateService(editing.id, payload);
      setItems((arr) => arr.map((x) => (x.id === upd.id ? upd : x)));
    } else {
      const created = await apiCreateService(payload);
      setItems((arr) => [created, ...arr]);
    }
  };

  const toggle = async (id: number, s: ServiceStatus) => {
    const upd = await apiToggleService(id, s);
    setItems((arr) => arr.map((x) => (x.id === id ? upd : x)));
  };

  const askDelete = (id: number) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!deletingId) return;
    setConfirmLoading(true);
    try {
      await apiDeleteService(deletingId);
      setItems((arr) => arr.filter((x) => x.id !== deletingId));
      setConfirmOpen(false);
      setDeletingId(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-xs border p-4 sm:p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-sky-400" />
          <h2 className="font-bold">Quản lý danh mục dịch vụ</h2>
          <span className="text-sm text-slate-500">
            ({filtered.length} dịch vụ)
          </span>
        </div>

        <div className="space-y-1 flex flex-col sm:flex-row gap-2 w-full sm:w-auto ">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-7.5 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên, mã, khoa,…"
              className="mt-1 block w-full rounded-[var(--rounded)] border bg-white/90 pl-9 pr-3 py-3 text-[16px] leading-6 text-left shadow-xs outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="w-full sm:w-48">
            <SelectMenu<FilterKind>
              value={kind}
              onChange={(v) => setKind((v as FilterKind) || "all")}
              options={[
                { value: "all", label: "Tất cả nhóm" },
                { value: "exam", label: "Khám" },
                { value: "lab", label: "Xét nghiệm" },
                { value: "imaging", label: "CĐHA" },
                { value: "procedure", label: "Thủ thuật" },
              ]}
              className="h-11"
            />
          </div>
          <button
            onClick={openCreate}
            className="mt-1 cursor-pointer h-12 rounded-[var(--rounded)] bg-primary-linear text-white px-4 text-sm font-medium"
          >
            + Thêm dịch vụ
          </button>
        </div>
      </header>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-sky-400 text-white">
              <th className="px-3 py-2 text-left">Mã dịch vụ</th>
              <th className="px-3 py-2 text-left">Tên dịch vụ</th>
              <th className="px-3 py-2">Khoa/Phòng</th>
              <th className="px-3 py-2">Nhóm</th>
              <th className="px-3 py-2">Đơn vị</th>
              <th className="px-3 py-2">Đơn giá</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-500">
                  Chưa có dịch vụ.
                </td>
              </tr>
            )}

            {paged.map((s) => (
              <tr key={s.id} className="text-center border-b last:border-none">
                <td className="px-3 py-2 text-left font-medium">{s.code}</td>
                <td className="px-3 py-2 text-left font-bold">
                  {s.name}
                  {s.kind === "lab" && s.specimen && (
                    <span className="ml-2 text-xs text-slate-500">
                      ({s.specimen})
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">{s.department ?? "-"}</td>
                <td className="px-3 py-2">{kindLabel[s.kind]}</td>
                <td className="px-3 py-2">{s.unit ?? "-"}</td>
                <td className="px-3 py-2 text-red-500 font-semibold">
                  {s.price.toLocaleString("vi-VN")} ₫
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge(
                      s.status
                    )}`}
                  >
                    {s.status === "active" ? "Đang hoạt động" : "Tạm khoá"}
                  </span>
                </td>
                <td className="py-2 pr-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
                    <button
                      onClick={() => openEdit(s)}
                      className="bg-warning-linear text-white cursor-pointer inline-flex items-center justify-center gap-1 rounded-[var(--rounded)] px-2 py-1 min-w-[80px]"
                      title="Sửa"
                    >
                      <Pencil className="w-4 h-4" /> Sửa
                    </button>

                    <button
                      onClick={() =>
                        toggle(
                          s.id,
                          s.status === "active" ? "inactive" : "active"
                        )
                      }
                      className={`cursor-pointer inline-flex items-center justify-center gap-1 rounded-[var(--rounded)] px-2 py-1 min-w-[80px] ${
                        s.status === "active"
                          ? "bg-orange-100 text-orange-500 hover:bg-orange-100"
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      }`}
                      title={
                        s.status === "active" ? "Khoá dịch vụ" : "Mở dịch vụ"
                      }
                    >
                      <Power className="w-4 h-4" />
                      {s.status === "active" ? "Khoá" : "Mở"}
                    </button>

                    <button
                      onClick={() => askDelete(s.id)}
                      className="cursor-pointer inline-flex items-center justify-center gap-1 rounded-[var(--rounded)] bg-error-linear text-white px-2 py-1 min-w-[80px]"
                      title="Xoá"
                    >
                      <Trash2 className="w-4 h-4" /> Xoá
                    </button>
                  </div>

                  {/* Modal xác nhận dùng chung */}
                  <ConfirmModal
                    open={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    onConfirm={doDelete}
                    loading={confirmLoading}
                    title="Xoá dịch vụ khám bệnh"
                    description="Bạn có chắc muốn xoá dịch vụ này?"
                    confirmText="Xoá"
                    cancelText="Huỷ"
                    danger
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Trang {Math.min(page, last)} - {last}
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
            onClick={() => setPage(Math.min(last, page + 1))}
            disabled={page === last}
            className="cursor-pointer px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Modal */}
      <ServiceModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing ?? undefined}
        onSubmit={submit}
      />
    </section>
  );
}
