import React, { useState, useEffect } from 'react';
import {
  Scale,
  Footprints,
  Flame,
  Utensils,
  Droplets,
  Moon,
  HeartPulse,
  Smile,
  Dumbbell,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Info,
  Calendar
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MetricCard } from '../components/common/MetricCard.js';
import { ProgressBar } from '../components/common/ProgressBar.js';
import { Badge } from '../components/common/Badge.js';
import { api } from '../services/api.js';
import { DashboardSummaryData } from '../types/index.js';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
  onRefreshTrigger?: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onRefreshTrigger }) => {
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      setData(res);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load dashboard summary:', err);
      setError(err.message || 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [onRefreshTrigger]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading your health overview...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 text-center">
        <p className="text-rose-700 dark:text-rose-300 font-semibold">{error || 'Could not load dashboard'}</p>
        <button
          onClick={fetchSummary}
          className="mt-3 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { bodyMetrics, activity, nutrition, recovery, charts, user } = data;

  const chartData = (charts.weeklyActivity || []).map((s) => ({
    date: s.summaryDate ? s.summaryDate.slice(5) : '',
    steps: s.steps,
    calories: Math.round(s.estimatedCaloriesBurned)
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-brand-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-brand-700/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-brand-50 backdrop-blur-sm">
              Goal: {user.fitnessGoal.replace(/_/g, ' ').toUpperCase()}
            </span>
            <span className="text-xs text-brand-100 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {data.date}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user.name.split(' ')[0]}! 🌿
          </h2>
          <p className="text-brand-100 text-sm mt-1 max-w-xl">
            Here is your daily health snapshot. Every metric is backed by your real logged entries and verified formulas.
          </p>
        </div>

        {/* Quick Log Action Buttons */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('hydration')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 transition"
          >
            <Droplets className="w-4 h-4 text-sky-200" />
            <span>+ Water</span>
          </button>
          <button
            onClick={() => onNavigate('nutrition')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 transition"
          >
            <Utensils className="w-4 h-4 text-amber-200" />
            <span>+ Meal</span>
          </button>
          <button
            onClick={() => onNavigate('activity')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 transition"
          >
            <Footprints className="w-4 h-4 text-emerald-200" />
            <span>+ Activity</span>
          </button>
          <button
            onClick={() => onNavigate('body')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 transition"
          >
            <Scale className="w-4 h-4 text-teal-200" />
            <span>+ Weight</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Body Weight & BMI */}
        <MetricCard
          title="Current Weight"
          value={bodyMetrics.currentWeightKg !== null ? bodyMetrics.currentWeightKg : '--'}
          unit="kg"
          subtitle={
            bodyMetrics.bmi
              ? `BMI ${bodyMetrics.bmi.bmi} (${bodyMetrics.bmi.category})`
              : 'Add height & weight to calculate BMI'
          }
          icon={Scale}
          iconColor="text-teal-600 dark:text-teal-400"
          iconBg="bg-teal-50 dark:bg-teal-950/40"
          source={bodyMetrics.source}
          trend={
            bodyMetrics.weightTrendKg !== 0
              ? {
                  value: `${Math.abs(bodyMetrics.weightTrendKg)} kg`,
                  isPositive: bodyMetrics.weightTrendKg < 0,
                  label: bodyMetrics.weightTrendKg < 0 ? 'loss' : 'gain'
                }
              : undefined
          }
          onClick={() => onNavigate('body')}
        />

        {/* 2. Daily Steps */}
        <MetricCard
          title="Daily Steps"
          value={activity.steps.toLocaleString()}
          unit="steps"
          subtitle={`${((activity.distanceMeters || 0) / 1000).toFixed(1)} km traveled today`}
          icon={Footprints}
          iconColor="text-brand-600 dark:text-brand-400"
          iconBg="bg-brand-50 dark:bg-brand-950/40"
          source={activity.source}
          progress={{
            current: activity.steps,
            target: activity.stepGoal,
            color: 'bg-brand-500'
          }}
          onClick={() => onNavigate('activity')}
        />

        {/* 3. Calories Consumed */}
        <MetricCard
          title="Calories Consumed"
          value={nutrition.caloriesConsumed}
          unit="kcal"
          subtitle={`${nutrition.remainingCalories} kcal remaining of ${nutrition.calorieTarget}`}
          icon={Utensils}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-950/40"
          source="manual"
          progress={{
            current: nutrition.caloriesConsumed,
            target: nutrition.calorieTarget,
            color: 'bg-amber-500'
          }}
          onClick={() => onNavigate('nutrition')}
        />

        {/* 4. Hydration */}
        <MetricCard
          title="Water Intake"
          value={nutrition.waterMl}
          unit="ml"
          subtitle={`Goal: ${nutrition.waterGoalMl} ml (${Math.max(0, nutrition.waterGoalMl - nutrition.waterMl)} ml left)`}
          icon={Droplets}
          iconColor="text-sky-600 dark:text-sky-400"
          iconBg="bg-sky-50 dark:bg-sky-950/40"
          source="manual"
          progress={{
            current: nutrition.waterMl,
            target: nutrition.waterGoalMl,
            color: 'bg-sky-500'
          }}
          onClick={() => onNavigate('hydration')}
        />
      </div>

      {/* Second Row: Nutrition Breakdown & Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nutrition Macro Progress Card */}
        <div className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 border border-cream-200 dark:border-darkbg-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-500" />
                Macronutrient Balance
              </h3>
              <Badge variant="brand">{nutrition.mealCount} meals logged</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Track your daily macronutrient split against personalized targets computed from your BMR and goals.
            </p>

            <div className="space-y-4">
              <ProgressBar
                label="Protein"
                sublabel={`${nutrition.proteinGrams}g / ${nutrition.proteinTarget}g`}
                value={nutrition.proteinGrams}
                max={nutrition.proteinTarget}
                color="bg-emerald-500"
              />
              <ProgressBar
                label="Carbohydrates"
                sublabel={`${nutrition.carbohydrateGrams}g / ${nutrition.carbohydrateTarget}g`}
                value={nutrition.carbohydrateGrams}
                max={nutrition.carbohydrateTarget}
                color="bg-amber-500"
              />
              <ProgressBar
                label="Fats"
                sublabel={`${nutrition.fatGrams}g / ${nutrition.fatTarget}g`}
                value={nutrition.fatGrams}
                max={nutrition.fatTarget}
                color="bg-rose-500"
              />
              <ProgressBar
                label="Dietary Fiber"
                sublabel={`${nutrition.fiberGrams}g / ${nutrition.fiberTarget}g`}
                value={nutrition.fiberGrams}
                max={nutrition.fiberTarget}
                color="bg-teal-500"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-cream-200 dark:border-darkbg-700 flex justify-between items-center text-xs">
            <span className="text-slate-500">Estimated Burn: {activity.caloriesBurned} kcal</span>
            <button
              onClick={() => onNavigate('nutrition')}
              className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
            >
              View Food Diary →
            </button>
          </div>
        </div>

        {/* 7-Day Movement Activity Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-darkbg-800 rounded-3xl p-6 border border-cream-200 dark:border-darkbg-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Footprints className="w-5 h-5 text-brand-600" />
                7-Day Activity Trends
              </h3>
              <span className="text-xs text-slate-400">Steps & Active Minutes</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Real logged movement history. Daily step goal is indicated at {activity.stepGoal.toLocaleString()} steps.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                  <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="steps" fill="#10B981" radius={[6, 6, 0, 0]} name="Steps" />
                  <Bar dataKey="calories" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Calories Burned" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-cream-200 dark:border-darkbg-700 flex justify-between items-center text-xs">
            <span className="text-slate-500">Active Minutes Today: {activity.activeMinutes} mins</span>
            <button
              onClick={() => onNavigate('activity')}
              className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
            >
              Detailed Activity Log →
            </button>
          </div>
        </div>
      </div>

      {/* Third Row: Recovery, Sleep & Wellness Journal Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sleep Card */}
        <div
          onClick={() => onNavigate('sleep')}
          className="bg-white dark:bg-darkbg-800 rounded-3xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm cursor-pointer hover:border-brand-400 transition"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Latest Sleep</h4>
            </div>
            {recovery.latestSleep && (
              <Badge variant="info">{recovery.latestSleep.source}</Badge>
            )}
          </div>
          {recovery.latestSleep ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                  {recovery.latestSleep.durationHours}
                </span>
                <span className="text-xs text-slate-500">hours</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Quality: {recovery.latestSleep.sleepQuality ? '★'.repeat(recovery.latestSleep.sleepQuality) : 'Not rated'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No sleep logged yet. Click to record bedtime.</p>
          )}
        </div>

        {/* Resting Heart Rate Card */}
        <div
          onClick={() => onNavigate('body')}
          className="bg-white dark:bg-darkbg-800 rounded-3xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm cursor-pointer hover:border-brand-400 transition"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Resting Pulse</h4>
            </div>
            {recovery.restingHeartRate && (
              <Badge variant="neutral">{recovery.restingHeartRate.source}</Badge>
            )}
          </div>
          {recovery.restingHeartRate ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                  {recovery.restingHeartRate.bpm}
                </span>
                <span className="text-xs text-slate-500">bpm</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                Measured at rest • Lifestyle reference
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No heart rate record yet. Click to log pulse.</p>
          )}
        </div>

        {/* Daily Wellness Journal */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-white dark:bg-darkbg-800 rounded-3xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm cursor-pointer hover:border-brand-400 transition"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Smile className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Wellness Log</h4>
            </div>
            <Badge variant="success">Today</Badge>
          </div>
          {recovery.wellness ? (
            <div>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-700 dark:text-slate-200">
                <span>Energy: {recovery.wellness.energyScore || '-'}/10</span>
                <span>•</span>
                <span>Mood: {recovery.wellness.moodScore || '-'}/10</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">
                "{recovery.wellness.notes || 'No extra notes'}"
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Check in on today's energy & mood levels.</p>
          )}
        </div>
      </div>

      {/* Disclaimers & Integrity Note */}
      <div className="p-4 bg-cream-100/70 dark:bg-darkbg-800/50 rounded-2xl border border-cream-200 dark:border-darkbg-700 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
        <p>
          <strong>NutriCare Transparency Note:</strong> All metrics presented reflect manually entered logs or verified imports. We do not invent simulated live sensors. Body Mass Index (BMI) is a screening measure and does not directly calculate body composition or cardiovascular status.
        </p>
      </div>
    </div>
  );
};
