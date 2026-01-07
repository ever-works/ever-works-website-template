"use client"

import * as React from "react"
import { Button as HeroButton } from "@heroui/react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Define button variants for compatibility with existing code
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        "outline-solid": "border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-7 rounded-md px-2 text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        "icon-touch": "h-11 w-11 min-h-[44px] min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps extends Omit<React.ComponentPropsWithRef<typeof HeroButton>, 'variant' | 'size'>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    // Map shadcn variants to HeroUI variants
    const heroVariant =
      variant === "default" ? "solid" :
      variant === "destructive" ? "solid" :
      variant === "outline-solid" ? "bordered" :
      variant === "secondary" ? "flat" :
      variant === "ghost" ? "ghost" :
      variant === "link" ? "light" :
      variant === "success" ? "solid" : "solid";
    
    // Map shadcn sizes to HeroUI sizes
    const heroSize =
      size === "xs" ? "xs" :
      size === "sm" ? "sm" :
      size === "lg" ? "lg" :
      size === "icon-touch" ? "md" : "md";
    
    // Add custom classes for variants not directly supported by HeroUI
    let additionalClassNames = "";
    if (variant === "destructive") {
      additionalClassNames += " bg-destructive text-destructive-foreground hover:bg-destructive/90";
    }
    if (variant === "success") {
      additionalClassNames += " bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700";
    }
    if (variant === "link") {
      additionalClassNames += " underline-offset-4 hover:underline";
    }
    if (size === "icon") {
      additionalClassNames += " w-9 h-9 p-0";
    }
    if (size === "icon-touch") {
      additionalClassNames += " w-11 h-11 min-w-[44px] min-h-[44px] p-0";
    }
    
    return (
      <HeroButton
        className={cn(buttonVariants({ variant, size }), additionalClassNames, className)}
        ref={ref}
        variant={heroVariant}
        size={heroSize as any}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
