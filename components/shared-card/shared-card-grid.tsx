"use client";

import type { ItemData } from "@/lib/content";
import Item from "@/components/item";

interface SharedCardGridProps {
  items: ItemData[];
  LayoutComponent: React.ComponentType<{ children: React.ReactNode }>;
  onItemClick?: (item: ItemData) => void;
  renderCustomItem?: (item: ItemData, index: number) => React.ReactNode;
  animationDelay?: number;
  className?: string;
}

/**
 * SharedCardGrid - Renders a grid of items with animations
 * Follows Single Responsibility Principle - only responsible for rendering items
 */
export function SharedCardGrid({
  items,
  LayoutComponent,
  onItemClick,
  renderCustomItem,
  animationDelay = 100,
  className = "space-y-4",
}: SharedCardGridProps) {
  return (
    <div className={className}>
      <LayoutComponent>
        {items.map((item, index) => (
          <div
            key={item.slug}
            className="group animate-fadeInUp h-full"
            style={{
              animationDelay: `${index * animationDelay}ms`,
              animationFillMode: "both",
            }}
          >
            {renderCustomItem ? (
              renderCustomItem(item, index)
            ) : (
              <Item {...item} onNavigate={() => onItemClick?.(item)} />
            )}
          </div>
        ))}
      </LayoutComponent>
    </div>
  );
}
