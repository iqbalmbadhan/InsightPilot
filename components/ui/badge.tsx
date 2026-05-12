import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
        secondary:
          "border-transparent bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
        emerald:
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/60 dark:text-emerald-300",
        amber:
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/60 dark:text-amber-300",
        blue:
          "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/60 dark:text-blue-300",
        red:
          "border-red-200 bg-red-50 text-red-700 dark:border-red-800/50 dark:bg-red-900/60 dark:text-red-300",
        violet:
          "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800/50 dark:bg-violet-900/60 dark:text-violet-300",
        outline:
          "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300",
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
