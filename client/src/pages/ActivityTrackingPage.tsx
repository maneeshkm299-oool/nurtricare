import React, { useState, useEffect } from 'react';
import {
  Footprints,
  Plus,
  Flame,
  Clock,
  Navigation,
  Trash2,
  Calendar,
  Zap,
  Info,
  TrendingUp,
  Activity as ActivityIcon
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Modal } from '../components/common/Modal.js';
import { Badge } from '../components/common/Badge.js';
import { ProgressBar } from '../components/common/ProgressBar.js';
import { api } from '../services/api.js';
import { ActivityLog, DailyActivitySummary } from '../types/index.js';

export const activityTypes = [
  { id: 'walking', name: 'Walking', icon: '🚶‍♂️', defaultMet: 3.5 },
  { id: 'running', name: 'Running', icon: '🏃‍♂️', defaultMet: 8.5 },
  { id: 'cycling', name: 'Cycling', icon: '🚴‍♂️', defaultMet: 6.8 },
  { id: 'swimming', name: 'Swimming', icon: '🏊‍♂️', defaultMet: 7.0 },
  { id: 'hiking', name: 'Hiking', icon: '🥾', defaultMet: 6.0 },
  { id: 'dancing', name: 'Dancing', icon: '💃', defaultMet: 5.0 },
  { id: 'yoga', name: 'Yoga', icon: '🧘‍♂️', defaultMet: 2.8 },
  { id: 'stretching', name: 'Stretching & Mobility', icon: '🤸‍♂️', defaultMet: 2.3 },
  { id: 'sports', name: 'Sports (Badminton/Football)', icon: '🏸', defaultMet: 7.0 },
  { id: 'gym', name: 'Gym Workout', icon: '🏋️‍♂️', defaultMet: 5.5 },
  { id: 'home_workout', name: 'Home Workout / Calisthenics', icon: '🏠', defaultMet: 5.0 },
  { id: 'custom', name: 'Custom Activity', icon: '⚡', defaultMet: 4.5 },
];

export const ActivityTrackingPage: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [history, setHistory] = useState<DailyActivitySummary[]>([]);
  const [summary, setSummary] = useState<DailyActivitySummary | null>(null);
  const [goalSteps, setGoalSteps] = useState(10000);
  const [loading, setLoading] = useState(true);

  // Form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('walking');
  const [durationMins, setDurationMins] = useState('30');
  const [distanceKm, setDistanceKm] = useState('2.5');
  const [stepsInput, setStepsInput] = useState('3500');
  const [intensity, setIntensity] = useState('moderate');
  const [notes, setNotes] = useState('');
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const [actRes, sumRes, histRes] = await Promise.all([
        api.getActivities(50),
        api.getActivityDailySummary(),
        api.getActivityHistory(7)
      ]);
      setActivities(actRes.activities || []);
      setSummary(sumRes.summary);
      setGoalSteps(sumRes.goalSteps || 10000);
      setHistory(histRes.history || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const distanceM = distanceKm ? parseFloat(distanceKm) * 1000 : null;
      const steps = stepsInput ? parseInt(stepsInput) : null;
      await api.createActivity({
        activityType: selectedType,
        durationMinutes: parseInt(durationMins) || 30,
        distanceMeters: distanceM,
        steps: steps,
        intensity,
        recordedAt: new Date(activityDate).toISOString(),
        notes: notes || null,
        source: 'manual'
      });
      setIsModalOpen(false);
      setNotes('');
      loadActivities();
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Delete this activity entry?')) return;
    try {
      await api.deleteActivity(id);
      loadActivities();
    } catch (err) {
      console.error('Error deleting activity:', err);
    }
  };

  const chartData = history.map(h => ({
    date: h.summaryDate.slice(5),
    steps: h.steps,
    activeMinutes: h.activeMinutes,
    calories: Math.round(h.estimatedCaloriesBurned)
  }));

  const stepsToday = summary?.steps || 0;
  const activeMinsToday = summary?.activeMinutes || 0;
  const calsToday = summary?.estimatedCaloriesBurned || 0;
  const distKmToday = ((summary?.distanceMeters || 0) / 1000).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Footprints className="w-7 h-7 text-brand-600" />
            Physical Activity Tracking
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor daily step count, movement sessions, active minutes, and calorie expenditure.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Log Activity Session</span>
        </button>
      </div>

      {/* Daily Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Steps */}
        <div className="bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>TODAY'S STEPS</span>
            <Badge variant="brand">Manual / Logged</Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {stepsToday.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">/ {goalSteps.toLocaleString()}</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={stepsToday} max={goalSteps} color="bg-brand-500" height="h-2" showPercent={false} />
          </div>
        </div>

        {/* Active Minutes */}
        <div className="bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>ACTIVE MINUTES</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {activeMinsToday}
            </span>
            <span className="text-sm font-medium text-slate-500">minutes</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Recommended: 30-45 mins/day</p>
        </div>

        {/* Distance */}
        <div className="bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>ESTIMATED DISTANCE</span>
            <Navigation className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {distKmToday}
            </span>
            <span className="text-sm font-medium text-slate-500">km</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">From recorded walks & runs</p>
        </div>

        {/* Calories Burned */}
        <div className="bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>CALORIES BURNED</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {Math.round(calsToday)}
            </span>
            <span className="text-sm font-medium text-slate-500">kcal</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Calculated via metabolic MET</p>
        </div>
      </div>

      {/* 7-Day Chart */}
      <div className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 border border-cream-200 dark:border-darkbg-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Weekly Activity Overview
            </h3>
            <p className="text-xs text-slate-400">Steps and Active Minutes per Day</p>
          </div>
        </div>
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
              <Bar dataKey="activeMinutes" fill="#0284C7" radius={[6, 6, 0, 0]} name="Active Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white dark:bg-darkbg-800 rounded-3xl border border-cream-200 dark:border-darkbg-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-200 dark:border-darkbg-700 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Recent Activity Logs
          </h3>
          <span className="text-xs text-slate-400">{activities.length} sessions recorded</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-50 dark:bg-darkbg-900/50 text-slate-500 uppercase tracking-wider font-semibold border-b border-cream-200 dark:border-darkbg-700">
              <tr>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-4">Activity</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Steps</th>
                <th className="py-3 px-4">Intensity</th>
                <th className="py-3 px-4">Calories</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 dark:divide-darkbg-700 text-slate-700 dark:text-slate-200">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No physical activity recorded yet.
                  </td>
                </tr>
              ) : (
                activities.map((act) => {
                  const itemInfo = activityTypes.find(t => t.id === act.activityType.toLowerCase());
                  return (
                    <tr key={act.id} className="hover:bg-cream-50/70 dark:hover:bg-darkbg-700/40 transition">
                      <td className="py-3.5 px-6 whitespace-nowrap">{act.recordedAt.split('T')[0]}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 capitalize">
                        <span>{itemInfo?.icon || '🏃‍♂️'}</span>
                        <span>{itemInfo?.name || act.activityType}</span>
                      </td>
                      <td className="py-3.5 px-4">{act.durationMinutes} mins</td>
                      <td className="py-3.5 px-4">
                        {act.distanceMeters ? `${(act.distanceMeters / 1000).toFixed(2)} km` : '-'}
                      </td>
                      <td className="py-3.5 px-4">{act.steps ? act.steps.toLocaleString() : '-'}</td>
                      <td className="py-3.5 px-4 capitalize">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                          {act.intensity || 'moderate'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-amber-600">
                        {act.estimatedCaloriesBurned ? `${Math.round(act.estimatedCaloriesBurned)} kcal` : '-'}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-500">{act.notes || '-'}</td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteActivity(act.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hardware / Step Sensor Transparency Notice */}
      <div className="p-4 bg-cream-100/70 dark:bg-darkbg-800/50 rounded-2xl border border-cream-200 dark:border-darkbg-700 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
        <p>
          <strong>Step Tracking Transparency:</strong> Web browsers cannot reliably access mobile pedometer hardware in background state. Step counts in NutriCare are logged manually or imported via CSV / health platform synchronization.
        </p>
      </div>

      {/* Log Activity Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Physical Activity"
        subtitle="Record your workout or movement session"
      >
        <form onSubmit={handleSaveActivity} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Activity Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activityTypes.map((type) => (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 text-left transition ${
                    selectedType === type.id
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold'
                      : 'border-cream-300 dark:border-darkbg-700 text-slate-700 dark:text-slate-300 hover:bg-cream-100 dark:hover:bg-darkbg-700'
                  }`}
                >
                  <span className="text-base">{type.icon}</span>
                  <span className="truncate">{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duration (minutes) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={durationMins}
                onChange={(e) => setDurationMins(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Distance (km)
              </label>
              <input
                type="number"
                step="0.1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="e.g. 3.2"
                className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Step Count
              </label>
              <input
                type="number"
                value={stepsInput}
                onChange={(e) => setStepsInput(e.target.value)}
                placeholder="e.g. 4000"
                className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Intensity
              </label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
              >
                <option value="low">Light</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
                <option value="vigorous">Vigorous</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Morning outdoor jog with intervals"
              className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-sm"
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
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20"
            >
              Save Activity
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
