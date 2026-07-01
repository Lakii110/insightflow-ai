import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "outline" | "purple" | "cyan";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
    success: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    warning: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    danger: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    outline: "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-transparent",
    purple: "bg-violet-600 text-white",
    cyan: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
