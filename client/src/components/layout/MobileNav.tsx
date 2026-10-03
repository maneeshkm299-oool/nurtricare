import React from 'react';
import {
  LayoutDashboard,
  Scale,
  Footprints,
  Utensils,
  Menu
} from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMore: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, onOpenMore }) => {
  const quickItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'activity', label: 'Activity', icon: Footprints },
    { id: 'nutrition', label: 'Diet', icon: Utensils },
    { id: 'body', label: 'Body', icon: Scale },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-darkbg-800/95 backdrop-blur-md border-t border-cream-200 dark:border-darkbg-700 px-3 py-2 flex items-center justify-around shadow-lg">
      {quickItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              isActive
                ? 'text-brand-600 dark:text-brand-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}

      <button
        onClick={onOpenMore}
        className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px]">More</span>
      </button>
    </nav>
  );
};
