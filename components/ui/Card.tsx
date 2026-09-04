import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-surface2 border border-border rounded-lg p-5 shadow-card transition-shadow duration-300",
        hover && "accent-glow-hover hover:-translate-y-0.5 hover:shadow-card-hover",
        className
      )}
    >
      {children}
    </div>
  );
}
