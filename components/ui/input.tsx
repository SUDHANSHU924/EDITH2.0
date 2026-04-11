import * as React from "react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={`flex h-10 w-full rounded-lg border border-cyan/15 bg-surface px-3 py-2 text-sm text-white placeholder:text-text-tertiary focus-visible:outline-none focus-visible:border-cyan focus-visible:ring-0 focus-visible:shadow-[0_0_20px_rgba(0,240,255,0.15)] disabled:cursor-not-allowed disabled:opacity-50 font-sans transition-all duration-200 ${className}`}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = "Input"

export { Input }
