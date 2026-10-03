import React from 'react';
import {
  LayoutDashboard,
  Scale,
  Footprints,
  Utensils,
  Dumbbell,
  Moon,
  Droplets,
  BarChart3,
  Trophy,
  UserCog,
  HeartPulse,
  Leaf,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'body', label: 'Body Monitoring', icon: Scale },
  { id: 'activity', label: 'Activity Tracking', icon: Footprints },
  { id: 'nutrition', label: 'Nutrition & Diet', icon: Utensils },
  { id: 'workouts', label: 'Exercise & Workouts', icon: Dumbbell },
  { id: 'sleep', label: 'Sleep Monitoring', icon: Moon },
  { id: 'hydration', label: 'Hydration', icon: Droplets },
  { id: 'reports', label: 'Health Reports', icon: BarChart3 },
  { id: 'goals', label: 'Goals & Badges', icon: Trophy },
  { id: 'profile', label: 'Profile & Settings', icon: UserCog },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-cream-100 dark:bg-darkbg-800 border-r border-cream-200 dark:border-darkbg-700 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center border-b border-cream-200 dark:border-darkbg-700">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white relative">
              <Leaf className="w-6 h-6 stroke-[2.2]" />
              <HeartPulse className="w-3.5 h-3.5 text-amber-300 absolute -bottom-0.5 -right-0.5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-500 dark:from-brand-300 dark:to-emerald-400 bg-clip-text text-transparent">
                NutriCare
              </span>
              <p className="text-[11px] font-medium tracking-wide text-brand-700/70 dark:text-brand-300/70 uppercase">
                Health & Vitality
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
            Main Tracking
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-cream-200/70 dark:hover:bg-darkbg-700/60 hover:text-brand-700 dark:hover:text-brand-300'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-cream-200 dark:border-darkbg-700 bg-cream-50/50 dark:bg-darkbg-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-sm shrink-0 border border-brand-200 dark:border-brand-700">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
