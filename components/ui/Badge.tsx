import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "data"
  | "prep"
  | "model"
  | "eval";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface3 text-text-secondary border-border",
  accent: "bg-accent-subtle text-accent-text border-border-strong",
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  danger: "bg-danger/10 text-danger border-danger/30",
  data: "bg-node-data text-sky-300 border-sky-900",
  prep: "bg-node-prep text-lime-300 border-lime-900",
  model: "bg-node-model text-accent-text border-border-strong",
  eval: "bg-node-eval text-purple-300 border-purple-900",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-sm border text-[10px] font-mono uppercase tracking-wide",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
