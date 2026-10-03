import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.js';
import { AppLayout } from './components/layout/AppLayout.js';
import { AuthPage } from './pages/AuthPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { BodyMonitoringPage } from './pages/BodyMonitoringPage.js';
import { ActivityTrackingPage } from './pages/ActivityTrackingPage.js';
import { NutritionDietPage } from './pages/NutritionDietPage.js';
import { WorkoutsPage } from './pages/WorkoutsPage.js';
import { SleepPage } from './pages/SleepPage.js';
import { HydrationPage } from './pages/HydrationPage.js';
import { ReportsPage } from './pages/ReportsPage.js';
import { GoalsAchievementsPage } from './pages/GoalsAchievementsPage.js';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage.js';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-darkbg-900 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-bold text-brand-700 dark:text-brand-300">
          Initializing NutriCare...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleRefreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveTab} onRefreshTrigger={refreshTrigger} />;
      case 'body':
        return <BodyMonitoringPage />;
      case 'activity':
        return <ActivityTrackingPage />;
      case 'nutrition':
        return <NutritionDietPage />;
      case 'workouts':
        return <WorkoutsPage />;
      case 'sleep':
        return <SleepPage />;
      case 'hydration':
        return <HydrationPage />;
      case 'reports':
        return <ReportsPage />;
      case 'goals':
        return <GoalsAchievementsPage />;
      case 'profile':
        return <ProfileSettingsPage />;
      default:
        return <DashboardPage onNavigate={setActiveTab} onRefreshTrigger={refreshTrigger} />;
    }
  };

  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onRefreshData={handleRefreshData}
    >
      {renderActivePage()}
    </AppLayout>
  );
};

export default App;
