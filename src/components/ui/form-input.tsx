import type React from "react"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({ className, label, error, ...props }, ref) => {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-[#5a5a5a]">{label}</label>}
      <input
        className={cn(
          "w-full h-12 bg-white border-0 rounded-full px-4 text-[#5a5a5a] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[#5a9b5a] focus:ring-opacity-50",
          error && "ring-2 ring-red-500",
          className,
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
})
FormInput.displayName = "FormInput"

export { FormInput }
