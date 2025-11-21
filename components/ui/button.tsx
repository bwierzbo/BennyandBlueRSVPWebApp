import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wedding-dustyPink-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md hover:shadow-lg",
          {
            "bg-gradient-to-r from-wedding-dustyPink-500 via-wedding-roseGold-500 to-wedding-lavender-500 text-white shadow-[0_10px_30px_-12px_rgba(212,160,86,0.7)] hover:shadow-[0_15px_35px_-14px_rgba(107,31,65,0.45)] hover:-translate-y-0.5 active:translate-y-0": variant === "default",
            "bg-red-500 text-white hover:bg-red-600 active:bg-red-700": variant === "destructive",
            "border border-wedding-roseGold-300 bg-white text-wedding-roseGold-800 hover:bg-wedding-roseGold-50 hover:text-wedding-roseGold-900 shadow-inner": variant === "outline",
            "bg-wedding-roseGold-100 text-wedding-roseGold-800 hover:bg-wedding-roseGold-200": variant === "secondary",
            "text-wedding-dustyPink-700 hover:bg-wedding-dustyPink-100 hover:text-wedding-dustyPink-800": variant === "ghost",
            "text-wedding-dustyPink-600 underline-offset-4 hover:underline hover:text-wedding-dustyPink-700": variant === "link",
          },
          {
            "h-11 px-4 py-2": size === "default",
            "h-11 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-11 w-11": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }