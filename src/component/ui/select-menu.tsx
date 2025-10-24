import { Menu } from "@headlessui/react";
import { ChevronDown, Check } from "lucide-react";

type Allowed = string | number;

export type SelectOption<T extends Allowed> = {
  value: T;
  label: string;
  disabled?: boolean;
  statusColor?: string;
};

type SelectValue<T extends Allowed> = T | ""; // cho phép rỗng khi chưa chọn

type Props<T extends Allowed> = {
  label?: string;
  required?: boolean;
  value?: SelectValue<T>;
  options: SelectOption<T>[];
  placeholder?: string;
  onChange: (v: SelectValue<T>) => void;
  className?: string;

  // thêm để đồng bộ với input
  invalid?: boolean;
  error?: string;
  disabled?: boolean;
};

const cx = (...a: Array<string | false | undefined>) =>
  a.filter(Boolean).join(" ");

export function SelectMenu<T extends Allowed>({
  label,
  required,
  value,
  options,
  placeholder = "Chọn...",
  onChange,
  className = "",
  invalid = false,
  error,
  disabled = false,
}: Props<T>) {
  // chuẩn hoá undefined -> ""
  const safeValue = (value ?? "") as SelectValue<T>;
  const current =
    safeValue === "" ? undefined : options.find((o) => o.value === safeValue);

  return (
    <div className={cx("space-y-1.5", className)}>
      {label && (
        <div className="flex items-center gap-1">
          <label className="text-sm text-slate-600">{label}</label>
          {required && <span className="text-red-500">*</span>}
        </div>
      )}

      <Menu as="div" className="relative">
        <Menu.Button
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={cx(
            // base: cao 48px, font >=16 để iOS không zoom, đổ bóng nhẹ
            "mt-1 block w-full rounded-[var(--rounded)] border bg-white/90 px-4 py-3 text-[16px] leading-6 text-left shadow-xs outline-none cursor-pointer",
            invalid ? "border-red-400 focus:ring-red-300" : "border-slate-200",
            "pr-10", // chừa chỗ icon bên phải
            disabled && "opacity-60 pointer-events-none"
          )}
        >
          <span className={cx("block truncate", !current && "text-slate-400")}>
            {current?.label ?? placeholder}
          </span>

          {/* caret cố định bên phải để giống input có icon */}
          <ChevronDown
            className={cx(
              "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4",
              invalid ? "text-red-400" : "text-slate-400"
            )}
          />
        </Menu.Button>

        <Menu.Items
          className={cx(
            "absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-xl border bg-white shadow-lg focus:outline-none",
            "border-slate-200"
          )}
        >
          <div className="max-h-64 overflow-auto py-1">
            {/* Tùy chọn rỗng */}
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={() => onChange("" as SelectValue<T>)}
                  className={cx(
                    "w-full px-4 py-3 text-left text-[16px] leading-6 cursor-pointer",
                    active && "bg-slate-50"
                  )}
                >
                  {placeholder}
                </button>
              )}
            </Menu.Item>

            {options.map((o) => {
              const selected = o.value === safeValue;
              return (
                <Menu.Item key={String(o.value)} disabled={o.disabled}>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => !o.disabled && onChange(o.value as SelectValue<T>)}
                      disabled={o.disabled}
                      className={cx(
                        "w-full px-4 py-3 text-left text-[16px] leading-6 flex items-center justify-between",
                        o.disabled 
                          ? "cursor-not-allowed opacity-50 bg-gray-100" 
                          : "cursor-pointer",
                        active && !o.disabled && "bg-slate-50"
                      )}
                    >
                      <span className={cx("truncate", o.statusColor)}>{o.label}</span>
                      {selected && (
                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                      )}
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Menu>

      {invalid && !!error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
