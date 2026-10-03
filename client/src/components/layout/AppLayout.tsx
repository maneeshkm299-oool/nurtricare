import React, { useState } from 'react';
import { Sidebar, navItems } from './Sidebar.js';
import { Navbar } from './Navbar.js';
import { MobileNav } from './MobileNav.js';
import { api } from '../../services/api.js';

interface AppLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
  onRefreshData?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  setActiveTab,
  children,
  onRefreshData
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeItem = navItems.find((n) => n.id === activeTab);
  const activeTitle = activeItem ? activeItem.label : 'NutriCare';

  const handleQuickLogWater = async () => {
    try {
      await api.createWaterEntry({ amountMl: 250 });
      if (onRefreshData) onRefreshData();
    } catch (e) {
      console.error('Failed to quick log water', e);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-darkbg-900 transition-colors duration-200">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="lg:pl-72 flex flex-col min-h-screen">
        <Navbar
          activeTabTitle={activeTitle}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onQuickLogWater={handleQuickLogWater}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {children}
        </main>
      </div>

      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMore={() => setMobileMenuOpen(true)}
      />
    </div>
  );
};
