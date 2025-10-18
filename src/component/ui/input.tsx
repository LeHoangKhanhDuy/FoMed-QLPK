import React from "react";
import { cn } from "../../utils/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  invalid?: boolean;
};
export const Input = React.forwardRef<HTMLInputElement, Props>(
  ({ leftIcon, rightIcon, invalid, className, ...rest }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <span
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2",
              invalid ? "text-red-400" : "text-slate-400"
            )}
          >
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          {...rest}
          className={cn(
            // base: cao 48px, font >=16 để iOS không zoom, viền/đổ bóng nhẹ
            "block w-full rounded-[var(--rounded)] border bg-white/90 px-4 py-3 text-[16px] leading-6 shadow-xs outline-none",
            "placeholder:text-slate-400",
            "focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400",
            invalid ? "border-red-400 focus:ring-red-300" : "border-slate-200",
            leftIcon ? "pl-10" : undefined,
            rightIcon ? "pr-10" : undefined,
            className
          )}
        />
        {rightIcon && (
          <span
            className={cn(
              "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2",
              invalid ? "text-red-400" : "text-slate-400"
            )}
          >
            {rightIcon}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
