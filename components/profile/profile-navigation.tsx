"use client";

import { useEffect, useState } from "react";
import { FiUser, FiBriefcase, FiAward, FiFileText } from "react-icons/fi";

interface ProfileNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function ProfileNavigation({ activeTab = "about", onTabChange }: ProfileNavigationProps) {
  const [activeTabState, setActiveTabState] = useState(activeTab);

  useEffect(() => {
    setActiveTabState(activeTab);
  }, [activeTab]);

  const tabs = [
    { id: "about", label: "About", icon: FiUser },
    { id: "portfolio", label: "Portfolio", icon: FiBriefcase },
    { id: "skills", label: "Skills", icon: FiAward },
    { id: "submissions", label: "Submissions", icon: FiFileText },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTabState(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="sticky top-0 z-nav bg-white/80 dark:bg-gray-950/80 backdrop-blur-md rounded-t-2xl shadow-sm border-b border-gray-200 dark:border-gray-800 mb-4">
      <nav
        className="flex space-x-2 sm:space-x-4 px-2 sm:px-6 py-2 overflow-x-auto"
        role="tablist"
        aria-label="Profile Sections"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTabState === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary-500
                ${isActive
                  ? 'bg-theme-primary-600/10 text-theme-primary-700 dark:text-theme-primary-300 shadow border border-theme-primary-300 dark:border-theme-primary-700'
                  : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
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