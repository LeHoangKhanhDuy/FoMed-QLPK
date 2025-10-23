import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  phone?: string | null;
};

export default function MaskedPhone({ phone }: Props) {
  const [show, setShow] = useState(false);

  if (!phone) return <span>-</span>;

  // Ẩn tất cả trừ 3 số cuối
  const masked =
    phone.length > 3 ? "*".repeat(phone.length - 3) + phone.slice(-3) : phone;

  return (
    <div className="inline-flex items-center gap-2">
      <span className="font-medium tracking-wide select-none">
        {show ? phone : masked}
      </span>
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="cursor-pointer text-slate-500 hover:text-slate-700"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
