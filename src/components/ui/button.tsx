"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[0.625rem] text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9972C] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        gold: "bg-gradient-to-r from-[#C9972C] via-[#E8C76A] to-[#C9972C] bg-[length:200%_auto] text-[#1a0505] font-bold hover:bg-right hover:shadow-[0_0_20px_rgba(201,151,44,0.5)] hover:-translate-y-0.5",
        glass:
          "bg-surface text-foreground border border-border backdrop-blur-sm hover:bg-surface-hover hover:border-border-gold",
        "glass-gold":
          "bg-[rgba(201,151,44,0.12)] text-[#E8C76A] border border-[rgba(201,151,44,0.35)] hover:bg-[rgba(201,151,44,0.2)]",
        danger:
          "bg-red-900/30 text-red-400 border border-red-900/50 hover:bg-red-900/50",
        info: "bg-blue-900/30 text-blue-400 border border-blue-900/50 hover:bg-blue-900/50",
        ghost: "text-muted hover:text-foreground hover:bg-surface-hover",
        link: "text-[#E8C76A] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-4 text-xs",
        default: "h-10 px-6",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "glass",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
