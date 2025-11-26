"use client";

import { forwardRef, HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Container variants configuration using class-variance-authority
 * Provides consistent spacing and max-width options across the application
 */
const containerVariants = cva(
  // Base styles applied to all containers
  "w-full mx-auto",
  {
    variants: {
      /**
       * Maximum width variants
       * @default "7xl"
       */
      maxWidth: {
        sm: "max-w-(--breakpoint-sm)",     // 640px
        md: "max-w-(--breakpoint-md)",     // 768px
        lg: "max-w-(--breakpoint-lg)",     // 1024px
        xl: "max-w-(--breakpoint-xl)",     // 1280px
        "2xl": "max-w-(--breakpoint-2xl)", // 1536px
        "7xl": "max-w-7xl",        // 1280px (Tailwind default)
        full: "max-w-full",        // 100%
        none: "",                  // No max-width constraint
      },
      /**
       * Padding variants for responsive spacing
       * @default "default"
       */
      padding: {
        none: "",
        sm: "px-2 sm:px-4",
        default: "px-4 sm:px-6 lg:px-8",
        lg: "px-6 sm:px-8 lg:px-12",
        xl: "px-8 sm:px-12 lg:px-16",
      },
      /**
       * Centering behavior
       * @default true
       */
      centered: {
        true: "mx-auto",
        false: "",
      },
    },
    defaultVariants: {
      maxWidth: "7xl",
      padding: "default",
      centered: true,
    },
  }
);


export interface ContainerProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  /**
   * HTML tag to render as container
   * @default "div"
   */
  as?: "div" | "section" | "article" | "main" | "aside" | "nav";
  /**
   * Enable fluid container behavior
   * When true, the container will have a fluid width with max-width constraints
   * @default false
   */
  fluid?: boolean;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      as: Component = "div",
      className,
      maxWidth,
      padding,
      centered,
      fluid = false,
      children,
      ...props
    },
    ref
  ) => {
    // Override maxWidth to 'none' when fluid is true
    const effectiveMaxWidth = fluid ? "none" : maxWidth;

    return (
      <Component
        ref={ref}
        className={cn(
          containerVariants({
            maxWidth: effectiveMaxWidth,
            padding,
            centered,
          }),
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = "Container";

/**
 * Preset container variants for common use cases
 */
export const PageContainer = forwardRef<
  HTMLDivElement,
  Omit<ContainerProps, "as">
>((props, ref) => (
  <Container ref={ref} as="main" maxWidth="7xl" {...props} />
));

PageContainer.displayName = "PageContainer";

export const SectionContainer = forwardRef<
  HTMLDivElement,
  Omit<ContainerProps, "as">
>((props, ref) => (
  <Container ref={ref} as="section" {...props} />
));

SectionContainer.displayName = "SectionContainer";

export const ArticleContainer = forwardRef<
  HTMLDivElement,
  Omit<ContainerProps, "as">
>((props, ref) => (
  <Container ref={ref} as="article" maxWidth="lg" {...props} />
));

ArticleContainer.displayName = "ArticleContainer";

/**
 * Hook to get container classes programmatically
 * Useful for applying container styles to custom components
 * 
 * @example
 * ```tsx
 * const containerClasses = useContainerClasses({ maxWidth: 'lg', padding: 'lg' });
 * ```
 */
export const useContainerClasses = (
  props?: VariantProps<typeof containerVariants>
) => {
  return containerVariants(props);
};

/**
 * Export the variants for external use
 * Allows other components to reuse the same variant configuration
 */
export { containerVariants };
