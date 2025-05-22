"use client";

import { IconClassic, IconGrid, IconCard } from "@/components/icons/Icons";

type ViewToggleProps = {
  activeView?: 'classic' | 'grid' | 'card';
  onViewChange?: (view: 'classic' | 'grid' | 'card') => void;
};

export default function ViewToggle({ 
  activeView = 'classic', 
  onViewChange 
}: ViewToggleProps) {
  
  const handleViewChange = (view: 'classic' | 'grid' | 'card') => {
    if (onViewChange) {
      onViewChange(view);
    }
  };

  return (
    <div className="flex items-center gap-4 pb-3 justify-end">
      <button 
        className={activeView === 'classic' ? 'text-primary-600 cursor-pointer' : 'text-default-400'}
        onClick={() => handleViewChange('classic')}
      >
        <IconClassic />
      </button>
      <button 
        className={activeView === 'grid' ? 'text-primary-600' : 'text-default-400'}
        onClick={() => handleViewChange('grid')}
      >
        <IconGrid />
      </button>
      <button 
        className={activeView === 'card' ? 'text-primary-600' : 'text-default-400'}
        onClick={() => handleViewChange('card')}
      >
        <IconCard />
      </button>
    </div>
  );
} 