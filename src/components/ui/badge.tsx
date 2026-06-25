import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        gold: "bg-[rgba(201,151,44,0.12)] border border-[rgba(201,151,44,0.35)] text-[#E8C76A] text-xs px-2.5 py-0.5",
        glass: "bg-surface border border-border text-muted text-xs px-2.5 py-0.5",
        success: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs px-2.5 py-0.5",
        danger: "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs px-2.5 py-0.5",
        warning: "bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs px-2.5 py-0.5",
        info: "bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs px-2.5 py-0.5",
      },
    },
    defaultVariants: { variant: "glass" },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
