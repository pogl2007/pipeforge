"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "accent" | "ghost" | "danger-ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  accent:
    "bg-accent text-[#1a0e04] font-medium hover:bg-accent-hover shadow-accent-glow disabled:bg-surface3 disabled:text-text-muted disabled:shadow-none",
  ghost:
    "bg-transparent border border-border text-text-primary hover:border-border-strong hover:bg-surface2 disabled:text-text-muted disabled:border-border",
  "danger-ghost":
    "bg-transparent border border-border text-danger hover:border-danger hover:bg-danger/10",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-2.5 py-1.5 rounded-sm gap-1.5",
  md: "text-sm px-4 py-2 rounded gap-2",
  lg: "text-[15px] px-6 py-3 rounded gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps & HTMLMotionProps<"button">>(
  ({ className, variant = "ghost", size = "md", children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        transition={{ duration: 0.12 }}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center font-sans transition-colors duration-150 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
