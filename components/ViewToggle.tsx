"use client";

import { IconClassic, IconGrid, IconCard } from "@/components/icons/Icons";
import { useState } from "react";

type ViewToggleProps = {
  activeView?: 'classic' | 'grid' | 'card';
  onViewChange?: (view: 'classic' | 'grid' | 'card') => void;
};

export default function ViewToggle({ 
  activeView = 'classic', 
  onViewChange 
}: ViewToggleProps) {
  const [isHovering, setIsHovering] = useState<string | null>(null);
  
  const handleViewChange = (view: 'classic' | 'grid' | 'card') => {
    if (onViewChange) {
      onViewChange(view);
    }
  };

  return (
    <div className="flex items-center gap-1 pb-3 justify-end">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex items-center shadow-sm">
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
          title="List view"
          aria-label="Switch to list view"
        >
          <IconClassic />
        </button>
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
          title="Grid view"
          aria-label="Switch to grid view"
        >
          <IconGrid />
        </button>
        <button 
          className={`${
            activeView === 'card' 
              ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          } rounded-md p-2 transition-all duration-200 ease-in-out transform ${
            isHovering === 'card' ? 'scale-110' : ''
          } ${activeView === 'card' ? 'animate-pulse-subtle' : ''}`}
          onClick={() => handleViewChange('card')}
          onMouseEnter={() => setIsHovering('card')}
          onMouseLeave={() => setIsHovering(null)}
          title="Card view"
          aria-label="Switch to card view"
        >
          <IconCard />
        </button>
      </div>
    </div>
  );
} 