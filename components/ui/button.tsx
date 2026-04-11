import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:pointer-events-none disabled:opacity-50 font-mono",
  {
    variants: {
      variant: {
        default: "border border-cyan/30 bg-transparent text-cyan/80 hover:border-cyan hover:text-cyan hover:bg-cyan/10 active:bg-cyan/15",
        destructive: "border border-red bg-transparent text-red hover:border-red hover:bg-red/10 active:bg-red/20",
        secondary: "border border-violet/30 bg-transparent text-violet/80 hover:border-violet hover:text-violet hover:bg-violet/10",
        glass: "glass-panel text-text-secondary hover:text-white hover:border-cyan",
        ghost: "hover:bg-white/5 text-text-secondary hover:text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={buttonVariants({ variant, size, className })}
      ref={ref}
      {...props}
    />
  )
)
Button.displayName = "Button"

export { Button, buttonVariants }
