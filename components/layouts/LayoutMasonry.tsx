import { ReactNode } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

interface LayoutMasonryProps {
  children: ReactNode;
}

const MASONRY_CONFIG = {
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

export default function LayoutMasonry({ children }: LayoutMasonryProps) {
  return (
    <ResponsiveMasonry
      columnsCountBreakPoints={MASONRY_CONFIG.columnsBreakPoints}
      gutterBreakpoints={MASONRY_CONFIG.gutterBreakpoints}
    >
      <Masonry>{children}</Masonry>
    </ResponsiveMasonry>
  );
}
