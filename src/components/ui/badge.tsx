import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        gold: "bg-[rgba(201,151,44,0.12)] border border-[rgba(201,151,44,0.35)] text-[#E8C76A] text-xs px-2.5 py-0.5",
        glass: "bg-white/[0.08] border border-white/[0.12] text-white/85 text-xs px-2.5 py-0.5",
        success: "bg-emerald-900/30 border border-emerald-700/40 text-emerald-400 text-xs px-2.5 py-0.5",
        danger: "bg-red-900/30 border border-red-700/40 text-red-400 text-xs px-2.5 py-0.5",
        warning: "bg-amber-900/30 border border-amber-700/40 text-amber-400 text-xs px-2.5 py-0.5",
        info: "bg-blue-900/30 border border-blue-700/40 text-blue-400 text-xs px-2.5 py-0.5",
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
