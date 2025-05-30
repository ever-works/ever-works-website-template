import LayoutClassic from "./LayoutClassic";
import LayoutGrid from "./LayoutGrid";
import LayoutCards from "./LayoutCards";
import { JSX } from "react";

export type LayoutKey = 'classic' | 'grid' | 'cards';

export const layoutComponents: Record<LayoutKey, ({ children }: { children: React.ReactNode }) => JSX.Element> = {
  grid: LayoutGrid,
  cards: LayoutCards,
  classic: LayoutClassic,
};

export { LayoutClassic, LayoutGrid, LayoutCards,  };
