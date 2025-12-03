"use client";

import { ReactNode } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useContainerWidth } from "@/components/ui/container";

interface LayoutMasonryProps {
  children: ReactNode;
}

// Fixed width configuration (original)
const MASONRY_CONFIG_FIXED = {
  columnsBreakPoints: {
    320: 1,
    480: 1,  
    640: 2,  
    768: 2,  
    1024: 3,
  },
  
  gutterBreakpoints: {
    320: "8px",  
    480: "12px", 
    640: "16px", 
    768: "20px", 
    1024: "24px",
  },
};

// Fluid width configuration (more columns for wider screens)
const MASONRY_CONFIG_FLUID = {
  columnsBreakPoints: {
    320: 1,
    480: 1,  
    640: 2,  
    768: 2,  
    1024: 3,
    1280: 4,
    1536: 5,
    1920: 6,
  },
  
  gutterBreakpoints: {
    320: "8px",  
    480: "12px", 
    640: "16px", 
    768: "20px", 
    1024: "24px",
    1280: "24px",
    1536: "24px",
    1920: "24px",
  },
};

export default function LayoutMasonry({ children }: LayoutMasonryProps) {
  const containerWidth = useContainerWidth();
  const config = containerWidth === "fluid" ? MASONRY_CONFIG_FLUID : MASONRY_CONFIG_FIXED;

  return (
    <ResponsiveMasonry
      columnsCountBreakPoints={config.columnsBreakPoints}
      gutterBreakpoints={config.gutterBreakpoints}
    >
      <Masonry>{children}</Masonry>
    </ResponsiveMasonry>
  );
}
