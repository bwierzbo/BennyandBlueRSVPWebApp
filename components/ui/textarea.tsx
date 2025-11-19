import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-wedding-dustyPink-200 bg-white px-4 py-3 text-base text-gray-900 ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wedding-dustyPink-400 focus-visible:ring-offset-2 focus-visible:border-wedding-dustyPink-400 hover:border-wedding-dustyPink-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }