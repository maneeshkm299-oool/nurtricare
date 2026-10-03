import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  FileSpreadsheet,
  FileJson,
  Scale,
  Footprints,
  Flame,
  Moon,
  Droplets,
  Info
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '../services/api.js';

export const ReportsPage: React.FC = () => {
  const [filterPeriod, setFilterPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = filterPeriod === 'weekly' ? await api.getWeeklyReport() : await api.getMonthlyReport();
      setReport(res.report);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [filterPeriod]);

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      await api.downloadCsvReport();
    } catch (err) {
      console.error('Error downloading CSV:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleExportJson = async () => {
    try {
      setExporting(true);
      await api.downloadJsonArchive();
    } catch (err) {
      console.error('Error downloading JSON:', err);
    } finally {
      setExporting(false);
    }
  };

  const totals = report?.totals || { steps: 0, caloriesBurned: 0, activeMinutes: 0, waterMl: 0, caloriesConsumed: 0 };
  const averages = report?.averages || { dailySteps: 0, dailyActiveMinutes: 0, sleepHours: 0, restingHeartRateBpm: null };

  const activityData = (report?.activityTrend || []).map((a: any) => ({
    date: a.summaryDate.slice(5),
    steps: a.steps,
    calories: Math.round(a.estimatedCaloriesBurned)
  }));

  const weightData = (report?.weightTrend || []).map((w: any) => ({
    date: w.date.slice(5),
    weight: w.weightKg,
    waist: w.waistCm
  }));

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-brand-600" />
            Health Analytics & Exports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aggregated trends across movement, nutrition, hydration, sleep, and body composition.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period selector */}
          <div className="bg-cream-200/70 dark:bg-darkbg-800 p-1 rounded-2xl flex items-center border border-cream-300 dark:border-darkbg-700">
            <button
              onClick={() => setFilterPeriod('weekly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterPeriod === 'weekly'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setFilterPeriod('monthly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterPeriod === 'monthly'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              30 Days
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 dark:bg-darkbg-700 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
          >
            <FileJson className="w-4 h-4" />
            <span>JSON Archive</span>
          </button>
        </div>
      </div>

      {/* Aggregate Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
            <Footprints className="w-4 h-4 text-brand-600" />
            <span>TOTAL STEPS</span>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {totals.steps.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Avg {averages.dailySteps.toLocaleString()} / day</p>
        </div>

        <div className="bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>CALORIE BALANCE</span>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {totals.caloriesBurned} / {totals.caloriesConsumed}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Burned vs Consumed (kcal)</p>
        </div>

        <div className="bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
            <Droplets className="w-4 h-4 text-sky-500" />
            <span>WATER CONSUMED</span>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {(totals.waterMl / 1000).toFixed(1)} L
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across entire period</p>
        </div>

        <div className="bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
            <Moon className="w-4 h-4 text-indigo-500" />
            <span>AVERAGE SLEEP</span>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {averages.sleepHours} hrs
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Resting HR avg: {averages.restingHeartRateBpm || '--'} bpm
          </p>
        </div>
      </div>

      {/* Main Charts: Activity & Weight Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Progression */}
        <div className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
            Daily Movement & Step Output
          </h3>
          <p className="text-xs text-slate-400 mb-4">Steps per day during {filterPeriod}</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Body Weight Progression */}
        <div className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
            Weight Trajectory (kg)
          </h3>
          <p className="text-xs text-slate-400 mb-4">Periodic weigh-in progress</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
                <Line type="monotone" dataKey="weight" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CSV Export & Data Portability Explanation */}
      <div className="p-5 bg-cream-100/70 dark:bg-darkbg-800/50 rounded-2xl border border-cream-200 dark:border-darkbg-700 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            Data Portability & Verification
          </p>
          <p className="mt-0.5">
            NutriCare adheres to strict user data sovereignty. You can download your complete raw health dataset as a CSV spreadsheet or JSON archive at any time. All rows clearly delineate manual logs vs device imports.
          </p>
        </div>
      </div>
    </div>
  );
};
