import { Menu } from "@headlessui/react";
import { ChevronDown, Check } from "lucide-react";

type Allowed = string | number;

export type SelectOption<T extends Allowed> = {
  value: T;
  label: string;
};

type SelectValue<T extends Allowed> = T | ""; // cho phép rỗng khi chưa chọn

type Props<T extends Allowed> = {
  label?: string;
  value?: SelectValue<T>; // có thể undefined từ ngoài, ta sẽ chuẩn hoá về ""
  options: SelectOption<T>[];
  placeholder?: string;
  onChange: (v: SelectValue<T>) => void;
  className?: string;
};

export function SelectMenu<T extends Allowed>({
  label,
  value,
  options,
  placeholder = "Chọn...",
  onChange,
  className = "",
}: Props<T>) {
  // chuẩn hoá undefined -> ""
  const safeValue = (value ?? "") as SelectValue<T>;
  const current =
    safeValue === "" ? undefined : options.find((o) => o.value === safeValue);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center gap-1">
          <label className="text-sm text-slate-600">{label}</label>
          <p className="text-red-500">*</p>
        </div>
      )}

      <Menu as="div" className="relative">
        <Menu.Button className="mt-1 w-full flex items-center justify-between rounded-lg border px-3 py-2 bg-white text-left outline-none cursor-pointer">
          <span className="truncate">{current?.label ?? placeholder}</span>
          <ChevronDown className="w-4 h-4 opacity-70" />
        </Menu.Button>

        <Menu.Items className="absolute z-10 mt-1 w-full rounded-lg border bg-white shadow-md focus:outline-none">
          <div className="max-h-64 overflow-auto py-1">
            {/* Tùy chọn rỗng */}
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={() => onChange("" as SelectValue<T>)}
                  className={`w-full px-3 py-2 text-left cursor-pointer ${
                    active ? "bg-slate-50" : ""
                  }`}
                >
                  {placeholder}
                </button>
              )}
            </Menu.Item>

            {options.map((o) => {
              const selected = o.value === safeValue;
              return (
                <Menu.Item key={String(o.value)}>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => onChange(o.value as SelectValue<T>)}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between cursor-pointer ${
                        active ? "bg-slate-50" : ""
                      }`}
                    >
                      <span className="truncate">{o.label}</span>
                      {selected && (
                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                      )}
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Menu>
    </div>
  );
}
