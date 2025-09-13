import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  loading?: boolean; // nếu xử lý async
  danger?: boolean; // màu đỏ cho hành động xóa
};

export default function ConfirmModal({
  open,
  title = "Xác nhận",
  description = "Bạn có chắc muốn thực hiện thao tác này?",
  confirmText = "Đồng ý",
  cancelText = "Huỷ",
  onConfirm,
  onClose,
  loading = false,
  danger = true,
}: Props) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    // focus nút Huỷ khi mở
    closeBtnRef.current?.focus();

    // ESC để đóng
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <div className="flex justify-center mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={`w-6 h-6 ${
                danger ? "text-rose-500" : "text-amber-500"
              }`}
            />
            <h3 id="confirm-title" className="font-semibold text-2xl">
              {title}
            </h3>
          </div>
        </div>

        <p id="confirm-desc" className="text-sm text-slate-600 text-center mb-4">
          {description}
        </p>

        <div className="flex items-center justify-center gap-2">
          <button
            ref={closeBtnRef}
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer px-3 py-2 rounded-md border hover:bg-gray-50 disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`cursor-pointer px-3 py-2 rounded-md text-white ${
              danger ? "bg-error-linear" : "bg-primary-linear"
            }`}
          >
            {loading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
