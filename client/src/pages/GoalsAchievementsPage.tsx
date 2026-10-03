import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Plus,
  Flame,
  Zap,
  Footprints,
  Droplets,
  Dumbbell,
  Utensils,
  Trash2,
  CheckCircle,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { Modal } from '../components/common/Modal.js';
import { Badge } from '../components/common/Badge.js';
import { ProgressBar } from '../components/common/ProgressBar.js';
import { api } from '../services/api.js';
import { UserGoal } from '../types/index.js';

const goalTypeOptions = [
  { id: 'daily_steps', label: 'Daily Steps', defaultUnit: 'steps', defaultTarget: 10000 },
  { id: 'water_intake', label: 'Daily Water Intake', defaultUnit: 'ml', defaultTarget: 3000 },
  { id: 'sleep_duration', label: 'Sleep Duration', defaultUnit: 'minutes', defaultTarget: 480 },
  { id: 'workout_frequency', label: 'Workout Frequency', defaultUnit: 'days/week', defaultTarget: 4 },
  { id: 'daily_calories', label: 'Daily Calorie Limit', defaultUnit: 'kcal', defaultTarget: 2000 },
  { id: 'target_weight', label: 'Target Body Weight', defaultUnit: 'kg', defaultTarget: 70 },
  { id: 'weekly_exercise_minutes', label: 'Weekly Active Minutes', defaultUnit: 'minutes', defaultTarget: 200 },
];

export const GoalsAchievementsPage: React.FC = () => {
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [goalType, setGoalType] = useState('daily_steps');
  const [targetValue, setTargetValue] = useState('10000');
  const [unit, setUnit] = useState('steps');

  const loadGoals = async () => {
    try {
      setLoading(true);
      const res = await api.getGoals();
      setGoals(res.goals || []);
      setCurrentStreak(res.currentStreakDays || 0);
      setAchievements(res.achievements || []);
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleGoalTypeChange = (selected: string) => {
    setGoalType(selected);
    const opt = goalTypeOptions.find(o => o.id === selected);
    if (opt) {
      setUnit(opt.defaultUnit);
      setTargetValue(opt.defaultTarget.toString());
    }
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createGoal({
        goalType,
        targetValue: parseFloat(targetValue) || 1000,
        unit,
        isActive: true
      });
      setIsModalOpen(false);
      loadGoals();
    } catch (err) {
      console.error('Error creating goal:', err);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await api.deleteGoal(id);
      loadGoals();
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-500" />
            Goals, Streaks & Achievements
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Establish healthy targets, monitor consistency streaks, and unlock fitness milestones.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Set New Target</span>
        </button>
      </div>

      {/* Streak Showcase Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-6 h-6 text-amber-200 fill-amber-200 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-amber-100">
              Active Movement Streak
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black tracking-tight">
              {currentStreak}
            </span>
            <span className="text-lg font-bold text-amber-100">Consecutive Days</span>
          </div>
          <p className="text-xs text-amber-100/90 mt-1 max-w-md">
            Consistency is the foundation of metabolic health. Every active day adds to your journey streak!
          </p>
        </div>

        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center shrink-0">
          <Zap className="w-6 h-6 text-yellow-200 mx-auto mb-1" />
          <p className="text-xs font-extrabold uppercase">Next Milestone</p>
          <p className="text-sm font-bold text-amber-100 mt-0.5">
            {currentStreak < 7 ? `${7 - currentStreak} days to 7-Day Warrior` : '14-Day Champion'}
          </p>
        </div>
      </div>

      {/* Active User Goals */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          Your Active Targets
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g) => {
            const opt = goalTypeOptions.find(o => o.id === g.goalType);
            const label = opt ? opt.label : g.goalType.replace(/_/g, ' ');

            return (
              <div
                key={g.id}
                className="bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {label}
                    </span>
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="text-slate-300 hover:text-rose-500 p-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                      {g.targetValue.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{g.unit}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-cream-100 dark:border-darkbg-700 flex justify-between items-center text-[11px] text-slate-400">
                  <span>Status: Active</span>
                  <Badge variant="brand">Tracking</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Badges & Achievements Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Milestones & Badges
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-5 rounded-3xl border transition flex items-start gap-4 ${
                ach.unlocked
                  ? 'bg-white dark:bg-darkbg-800 border-amber-300/60 dark:border-amber-700/60 shadow-md shadow-amber-500/5'
                  : 'bg-cream-100/50 dark:bg-darkbg-900/50 border-cream-200 dark:border-darkbg-800 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  ach.unlocked
                    ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-white'
                    : 'bg-slate-200 dark:bg-darkbg-700 text-slate-400'
                }`}
              >
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {ach.title}
                  </h4>
                  {ach.unlocked ? (
                    <Badge variant="warning">Unlocked</Badge>
                  ) : (
                    <Badge variant="neutral">In Progress</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {ach.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goal Encouragement Philosophy */}
      <div className="p-4 bg-cream-100/70 dark:bg-darkbg-800/50 rounded-2xl border border-cream-200 dark:border-darkbg-700 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
        <p>
          <strong>NutriCare Wellness Philosophy:</strong> Targets are supportive guides, not punitive mandates. Adjust your goals whenever your recovery, schedule, or life season demands flexibility.
        </p>
      </div>

      {/* New Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set New Wellness Target"
        subtitle="Define measurable daily or weekly goals"
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Goal Type *
            </label>
            <select
              value={goalType}
              onChange={(e) => handleGoalTypeChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs font-bold"
            >
              {goalTypeOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Value *
              </label>
              <input
                type="number"
                step="any"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit *
              </label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
              />
            </div>
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
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold"
            >
              Save Target
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
