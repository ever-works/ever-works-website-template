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
    <div className="flex items-center gap-1 justify-end">
      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-1 flex items-center shadow-md dark:shadow-lg border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl">
        <Tooltip 
          content="List view" 
          showArrow 
          placement="top"
          delay={300}
          classNames={{
            content: "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded text-xs font-medium"
          }}
        >
          <button 
            className={`${
              activeView === 'classic' 
                ? 'bg-blue-500 text-white shadow-md transform scale-105' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
            } rounded-md p-1 transition-all duration-300 ease-out transform ${
              isHovering === 'classic' && activeView !== 'classic' ? 'scale-110 shadow-sm' : ''
            } focus:outline-none focus:ring-1 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-800 flex items-center justify-center`}
            onClick={() => handleViewChange('classic')}
            onMouseEnter={() => setIsHovering('classic')}
            onMouseLeave={() => setIsHovering(null)}
            aria-label="Switch to list view"
          >
            <div className={`transition-all duration-300 w-4 h-4 flex items-center justify-center ${activeView === 'classic' ? 'drop-shadow-sm' : ''}`}>
              <IconClassic />
            </div>
          </button>
        </Tooltip>
        
        <Tooltip 
          content="Grid view" 
          showArrow 
          placement="top" 
          delay={300}
          classNames={{
            content: "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded text-xs font-medium"
          }}
        >
          <button 
            className={`${
              activeView === 'grid' 
                ? 'bg-blue-500 text-white shadow-md transform scale-105' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
            } rounded-md p-1 transition-all duration-300 ease-out transform ${
              isHovering === 'grid' && activeView !== 'grid' ? 'scale-110 shadow-sm' : ''
            } focus:outline-none focus:ring-1 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-800 flex items-center justify-center`}
            onClick={() => handleViewChange('grid')}
            onMouseEnter={() => setIsHovering('grid')}
            onMouseLeave={() => setIsHovering(null)}
            aria-label="Switch to grid view"
          >
            <div className={`transition-all duration-300 w-4 h-4 flex items-center justify-center ${activeView === 'grid' ? 'drop-shadow-sm' : ''}`}>
              <IconGrid />
            </div>
          </button>
        </Tooltip>
        
        <Tooltip 
          content="Card view" 
          showArrow 
          placement="top" 
          delay={300}
          classNames={{
            content: "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded text-xs font-medium"
          }}
        >
          <button 
            className={`${
              activeView === 'cards' 
                ? 'bg-blue-500 text-white shadow-md transform scale-105' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
            } rounded-md p-1 transition-all duration-300 ease-out transform ${
              isHovering === 'cards' && activeView !== 'cards' ? 'scale-110 shadow-sm' : ''
            } focus:outline-none focus:ring-1 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-800 flex items-center justify-center`}
            onClick={() => handleViewChange('cards')}
            onMouseEnter={() => setIsHovering('cards')}
            onMouseLeave={() => setIsHovering(null)}
            aria-label="Switch to card view"
          >
            <div className={`transition-all duration-300 w-4 h-4 flex items-center justify-center ${activeView === 'cards' ? 'drop-shadow-sm' : ''}`}>
              <IconCard />
            </div>
          </button>
        </Tooltip>
      </div>
    </div>
  );
} 