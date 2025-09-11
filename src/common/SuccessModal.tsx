import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

type Props = {
  open: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  autoCloseMs?: number; // tự đóng sau N ms (vd: 1500)
  okText?: string; // text nút OK
};

export default function SuccessModal({
  open,
  title = "Thành công",
  message = "Thông tin đã được lưu.",
  onClose,
  autoCloseMs = 1500,
  okText = "Đóng",
}: Props) {
  useEffect(() => {
    if (!open) return;

    // ESC để đóng
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    // Tự đóng nếu có autoCloseMs
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (autoCloseMs > 0) {
      timer = setTimeout(onClose, autoCloseMs);
    }

    return () => {
      window.removeEventListener("keydown", onKey);
      if (timer !== null) clearTimeout(timer);
    };
  }, [open, onClose, autoCloseMs]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-3 bg-white rounded-xl shadow-lg p-5 text-center">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 p-2 rounded-md hover:bg-slate-100"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center mb-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-slate-600">{message}</p>

        <div className="mt-4">
          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {okText}
          </button>
        </div>
      </div>
    </div>
  );
}
