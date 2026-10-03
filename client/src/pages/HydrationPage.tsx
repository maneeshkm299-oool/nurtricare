import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Plus,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Modal } from '../components/common/Modal.js';
import { Badge } from '../components/common/Badge.js';
import { api } from '../services/api.js';
import { WaterEntry } from '../types/index.js';

export const HydrationPage: React.FC = () => {
  const [entries, setEntries] = useState<WaterEntry[]>([]);
  const [totalMl, setTotalMl] = useState(0);
  const [goalMl, setGoalMl] = useState(2500);
  const [remainingMl, setRemainingMl] = useState(2500);
  const [progressPercent, setProgressPercent] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Custom modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('250');

  const loadWater = async () => {
    try {
      setLoading(true);
      const res = await api.getWater(selectedDate);
      setEntries(res.entries || []);
      setTotalMl(res.totalMl || 0);
      setGoalMl(res.goalMl || 2500);
      setRemainingMl(res.remainingMl || 0);
      setProgressPercent(res.progressPercent || 0);
    } catch (err) {
      console.error('Error loading water data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWater();
  }, [selectedDate]);

  const handleQuickAdd = async (amount: number) => {
    try {
      await api.createWaterEntry({ amountMl: amount });
      loadWater();
    } catch (err) {
      console.error('Error logging quick water:', err);
    }
  };

  const handleCustomAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createWaterEntry({ amountMl: parseInt(customAmount) || 250 });
      setIsModalOpen(false);
      setCustomAmount('250');
      loadWater();
    } catch (err) {
      console.error('Error logging custom water:', err);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await api.deleteWaterEntry(id);
      loadWater();
    } catch (err) {
      console.error('Error deleting water entry:', err);
    }
  };

  // SVG Circular progress ring calculations
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, progressPercent) / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Droplets className="w-7 h-7 text-sky-500" />
            Hydration Tracker
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maintain optimal cellular hydration, cognitive focus, and electrolyte balance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-darkbg-800 border border-cream-300 dark:border-darkbg-700 text-xs font-semibold shadow-sm"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Custom Amount</span>
          </button>
        </div>
      </div>

      {/* Main Hydration Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circular Progress Ring Card */}
        <div className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 sm:p-8 border border-cream-200 dark:border-darkbg-700 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Daily Water Completion
          </h3>

          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
              <circle
                stroke="currentColor"
                className="text-slate-100 dark:text-darkbg-700"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="currentColor"
                className="text-sky-500 transition-all duration-700 ease-out"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>

            {/* Inner Center Text */}
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                {totalMl}
              </span>
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                / {goalMl} ml
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {progressPercent}% Goal
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            {remainingMl > 0 ? `${remainingMl} ml remaining to hit your target` : '🎉 Daily hydration goal accomplished!'}
          </p>
        </div>

        {/* Quick Add Buttons & Guidance */}
        <div className="lg:col-span-2 bg-white dark:bg-darkbg-800 rounded-3xl p-6 sm:p-8 border border-cream-200 dark:border-darkbg-700 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
              One-Click Quick Log
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Tap a preset amount to instantly add to your today's total.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { amount: 250, label: 'Small Glass', icon: '🥛' },
                { amount: 500, label: 'Standard Bottle', icon: '🍶' },
                { amount: 750, label: 'Large Flask', icon: '🚰' },
                { amount: 1000, label: '1 Liter Pitcher', icon: '🧊' },
              ].map((item) => (
                <button
                  key={item.amount}
                  onClick={() => handleQuickAdd(item.amount)}
                  className="p-4 rounded-2xl bg-cream-50 dark:bg-darkbg-900 border border-cream-200 dark:border-darkbg-700 hover:border-sky-400 dark:hover:border-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition text-center flex flex-col items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                    +{item.amount} ml
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Hydration advice */}
          <div className="mt-6 pt-4 border-t border-cream-200 dark:border-darkbg-700 flex items-start gap-2.5 text-xs text-slate-500">
            <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            <p>
              Target hydration depends on body mass, climate, and sweat rate. Drink steady quantities throughout the morning and afternoon, reducing large intakes 1 hour before bedtime.
            </p>
          </div>
        </div>
      </div>

      {/* Hydration Entries Table */}
      <div className="bg-white dark:bg-darkbg-800 rounded-3xl border border-cream-200 dark:border-darkbg-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-200 dark:border-darkbg-700 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Today's Logged Intakes
          </h3>
          <span className="text-xs text-slate-400">{entries.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-50 dark:bg-darkbg-900/50 text-slate-500 uppercase tracking-wider font-semibold border-b border-cream-200 dark:border-darkbg-700">
              <tr>
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-4">Amount Logged</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 dark:divide-darkbg-700 text-slate-700 dark:text-slate-200">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    No hydration recorded for this date yet. Tap a quick add button above!
                  </td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.id} className="hover:bg-cream-50/70 dark:hover:bg-darkbg-700/40 transition">
                    <td className="py-3.5 px-6 font-medium">
                      {new Date(e.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-sky-600 dark:text-sky-400">
                      {e.amountMl} ml
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleDeleteEntry(e.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Amount Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Custom Water Amount"
        subtitle="Enter specific volume in milliliters"
      >
        <form onSubmit={handleCustomAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Water Volume (ml) *
            </label>
            <input
              type="number"
              min="50"
              max="3000"
              step="50"
              required
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-sm font-bold"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-cream-200 dark:border-darkbg-700">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold"
            >
              Add Water
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
