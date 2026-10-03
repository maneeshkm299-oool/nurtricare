import React from 'react';
import { Menu, Sun, Moon, Sparkles, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.js';
import { useAuth } from '../../context/AuthContext.js';

interface NavbarProps {
  activeTabTitle: string;
  onOpenMobileMenu: () => void;
  onQuickLogWater?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTabTitle, onOpenMobileMenu, onQuickLogWater }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date());

  return (
    <header className="h-20 bg-cream-50/80 dark:bg-darkbg-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-cream-200 dark:border-darkbg-700 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-cream-200 dark:hover:bg-darkbg-700 transition"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            {activeTabTitle}
          </h1>
          <p className="text-xs text-brand-700 dark:text-brand-400 font-medium">
            Today • {formattedDate}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onQuickLogWater && (
          <button
            onClick={onQuickLogWater}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 text-xs font-semibold rounded-full border border-sky-200 dark:border-sky-800 transition shadow-sm"
          >
            <span>💧</span>
            <span>+250ml Water</span>
          </button>
        )}

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2.5 rounded-xl bg-white dark:bg-darkbg-800 border border-cream-200 dark:border-darkbg-700 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 shadow-sm transition"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-3 pl-2 sm:border-l border-cream-200 dark:border-darkbg-700">
          <div className="w-9 h-9 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            {user?.name?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};
