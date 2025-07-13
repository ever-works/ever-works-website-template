"use client";

import { useState } from "react";
import { FiUser, FiBriefcase, FiAward } from "react-icons/fi";

interface ProfileNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function ProfileNavigation({ activeTab = "about", onTabChange }: ProfileNavigationProps) {
  const [activeTabState, setActiveTabState] = useState(activeTab);

  const tabs = [
    { id: "about", label: "About", icon: FiUser },
    { id: "portfolio", label: "Portfolio", icon: FiBriefcase },
    { id: "skills", label: "Skills", icon: FiAward },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTabState(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTabState === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                ${isActive 
                  ? 'border-theme-primary-500 text-theme-primary-600 dark:text-theme-primary-400' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
} 