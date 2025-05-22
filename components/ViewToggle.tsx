"use client";

import { IconClassic, IconGrid, IconCard } from "@/components/icons/Icons";
import { useState } from "react";
import { Tooltip } from "@heroui/tooltip";

type ViewToggleProps = {
  activeView?: 'classic' | 'grid' | 'cards';
  onViewChange?: (view: 'classic' | 'grid' | 'cards') => void;
};

export default function ViewToggle({ 
  activeView = 'classic', 
  onViewChange 
}: ViewToggleProps) {
  const [isHovering, setIsHovering] = useState<ViewToggleProps['activeView'] | null>(null);
  
  const handleViewChange = (view: 'classic' | 'grid' | 'cards') => {
    if (onViewChange) {
      onViewChange(view);
    }
  };

  return (
    <div className="flex items-center gap-1 pb-1 justify-end">
      <div className="bg-gray-100 dark:bg-dark--theme-900 rounded-lg p-1 flex items-center shadow-sm">
        <Tooltip 
          content="List view" 
          showArrow 
          placement="top"
          className="dark:bg-dark--theme-900"
        >
          <button 
            className={`${
              activeView === 'classic' 
                ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            } rounded-md p-2 transition-all duration-200 ease-in-out transform ${
              isHovering === 'classic' ? 'scale-110' : ''
            } ${activeView === 'classic' ? 'animate-pulse-subtle' : ''}`}
            onClick={() => handleViewChange('classic')}
            onMouseEnter={() => setIsHovering('classic')}
            onMouseLeave={() => setIsHovering(null)}
            aria-label="Switch to list view"
          >
            <IconClassic />
          </button>
        </Tooltip>
        
        <Tooltip 
          content="Grid view" 
          showArrow 
          placement="top" 
          className="dark:bg-dark--theme-900"
        >
          <button 
            className={`${
              activeView === 'grid' 
                ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            } rounded-md p-2 transition-all duration-200 ease-in-out transform ${
              isHovering === 'grid' ? 'scale-110' : ''
            } ${activeView === 'grid' ? 'animate-pulse-subtle' : ''}`}
            onClick={() => handleViewChange('grid')}
            onMouseEnter={() => setIsHovering('grid')}
            onMouseLeave={() => setIsHovering(null)}
            aria-label="Switch to grid view"
          >
            <IconGrid />
          </button>
        </Tooltip>
        
        <Tooltip 
          content="Card view" 
          showArrow 
          placement="top" 
          className="dark:bg-dark--theme-900"
        >
          <button 
            className={`${
              activeView === 'cards' 
                ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            } rounded-md p-2 transition-all duration-200 ease-in-out transform ${
              isHovering === 'cards' ? 'scale-110' : ''
            } ${activeView === 'cards' ? 'animate-pulse-subtle' : ''}`}
            onClick={() => handleViewChange('cards')}
            onMouseEnter={() => setIsHovering('cards')}
            onMouseLeave={() => setIsHovering(null)}
            aria-label="Switch to card view"
          >
            <IconCard />
          </button>
        </Tooltip>
      </div>
    </div>
  );
} 