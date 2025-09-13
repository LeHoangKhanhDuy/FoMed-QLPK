import { cn } from "../../Utils/cn";

type FieldProps = {
  label?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
};
export function FormField({
  label,
  required,
  error,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex items-center gap-1">
          <label className="text-sm text-slate-600">{label}</label>
          {required && <span className="text-red-500">*</span>}
        </div>
      )}
      {children}
      {!!error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
