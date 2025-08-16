import type * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-base font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-purple-primary focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-purple-primary to-purple-primary-dark text-white shadow-[0_4px_12px_rgba(147,51,234,0.3)] hover:shadow-[0_8px_20px_rgba(147,51,234,0.4)] hover:-translate-y-0.5 rounded-3xl",
        secondary:
          "bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 rounded-3xl",
        ghost: "bg-transparent text-gray-600 hover:bg-purple-primary/5 hover:text-purple-primary rounded-3xl",
        success:
          "bg-gradient-to-br from-green-success to-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 rounded-3xl",
        destructive:
          "bg-red-error text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:bg-red-600 hover:shadow-[0_8px_20px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 rounded-3xl",
        outline:
          "border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 rounded-3xl",
        link: "text-purple-primary underline-offset-4 hover:underline hover:text-purple-primary-dark bg-transparent",
        blue: "bg-gradient-to-br from-blue-secondary to-blue-700 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_20px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 rounded-3xl",
      },
      size: {
        sm: "h-8 px-3 py-1.5 text-sm",
        default: "h-10 px-4 py-2 text-sm",
        lg: "h-11 px-5 py-2.5 text-base",
        xl: "h-12 px-6 py-3 text-base font-semibold",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
