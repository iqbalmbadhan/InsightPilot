import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zinc-700 text-zinc-200",
        secondary:
          "border-transparent bg-zinc-800 text-zinc-300",
        emerald:
          "border-transparent bg-emerald-900/60 text-emerald-300 border-emerald-800/50",
        amber:
          "border-transparent bg-amber-900/60 text-amber-300 border-amber-800/50",
        blue:
          "border-transparent bg-blue-900/60 text-blue-300 border-blue-800/50",
        red:
          "border-transparent bg-red-900/60 text-red-300 border-red-800/50",
        violet:
          "border-transparent bg-violet-900/60 text-violet-300 border-violet-800/50",
        outline:
          "border-zinc-700 text-zinc-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
