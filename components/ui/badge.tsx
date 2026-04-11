import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-void",
  {
    variants: {
      variant: {
        default: "border-cyan bg-cyan/10 text-cyan hover:bg-cyan/20",
        secondary: "border-violet bg-violet/10 text-violet hover:bg-violet/20",
        destructive: "border-red bg-red/10 text-red hover:bg-red/20",
        outline: "border-text-secondary text-text-secondary hover:bg-white/10",
        success: "border-status-green bg-status-green/10 text-status-green hover:bg-status-green/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={badgeVariants({ variant, className })} {...props} />
  )
}

export { Badge, badgeVariants }
