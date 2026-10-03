import React, { useState, useEffect } from 'react';
import {
  Moon,
  Plus,
  Trash2,
  Clock,
  Star,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Modal } from '../components/common/Modal.js';
import { Badge } from '../components/common/Badge.js';
import { ProgressBar } from '../components/common/ProgressBar.js';
import { api } from '../services/api.js';
import { SleepRecord } from '../types/index.js';

export const SleepPage: React.FC = () => {
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [avgDuration, setAvgDuration] = useState(0);
  const [goalMinutes, setGoalMinutes] = useState(480);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [bedtimeDate, setBedtimeDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });
  const [bedtimeTime, setBedtimeTime] = useState('23:00');
  const [wakeDate, setWakeDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepQuality, setSleepQuality] = useState(4);
  const [notes, setNotes] = useState('');

  const loadSleep = async () => {
    try {
      setLoading(true);
      const res = await api.getSleepRecords();
      setRecords(res.records || []);
      setAvgDuration(res.averageDurationMinutes || 0);
      setGoalMinutes(res.sleepGoalMinutes || 480);
    } catch (err) {
      console.error('Error loading sleep records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSleep();
  }, []);

  const handleSaveSleep = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bedIso = new Date(`${bedtimeDate}T${bedtimeTime}:00`).toISOString();
      const wakeIso = new Date(`${wakeDate}T${wakeTime}:00`).toISOString();

      await api.createSleepRecord({
        bedtime: bedIso,
        wakeTime: wakeIso,
        sleepQuality,
        notes: notes || null,
        source: 'manual'
      });

      setIsModalOpen(false);
      setNotes('');
      loadSleep();
    } catch (err) {
      console.error('Error saving sleep:', err);
    }
  };

  const handleDeleteSleep = async (id: string) => {
    if (!confirm('Delete this sleep record?')) return;
    try {
      await api.deleteSleepRecord(id);
      loadSleep();
    } catch (err) {
      console.error('Error deleting sleep record:', err);
    }
  };

  const chartData = [...records].slice(0, 7).reverse().map((r) => ({
    date: r.bedtime.split('T')[0].slice(5),
    hours: parseFloat((r.durationMinutes / 60).toFixed(1)),
    quality: r.sleepQuality || 0
  }));

  const latest = records[0] || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Moon className="w-7 h-7 text-indigo-500" />
            Sleep Monitoring & Recovery
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track bedtime, wake schedule, sleep duration consistency, and self-rated quality.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Log Sleep Session</span>
        </button>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>LATEST SLEEP</span>
            <Badge variant="info">{latest?.source || 'manual'}</Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {latest ? (latest.durationMinutes / 60).toFixed(1) : '--'}
            </span>
            <span className="text-sm font-medium text-slate-500">hours</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {latest
              ? `Woke up at ${new Date(latest.wakeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'No sleep recorded yet'}
          </p>
        </div>

        <div className="bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>AVERAGE DURATION</span>
            <Clock className="w-4 h-4 text-brand-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {(avgDuration / 60).toFixed(1)}
            </span>
            <span className="text-sm font-medium text-slate-500">hours / night</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={avgDuration} max={goalMinutes} color="bg-indigo-500" height="h-2" showPercent={false} />
          </div>
        </div>

        <div className="bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>TARGET SLEEP GOAL</span>
            <span className="text-xs font-bold text-brand-600">Goal</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {(goalMinutes / 60).toFixed(1)}
            </span>
            <span className="text-sm font-medium text-slate-500">hours</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Optimal restorative window for muscle repair & mental focus
          </p>
        </div>
      </div>

      {/* Sleep Trend Bar Chart */}
      <div className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 border border-cream-200 dark:border-darkbg-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Sleep Duration History (Last 7 Sessions)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Hours rested per recorded night</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
              <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis domain={[0, 12]} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="hours" fill="#6366F1" radius={[6, 6, 0, 0]} name="Hours Rested" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sleep Records Table */}
      <div className="bg-white dark:bg-darkbg-800 rounded-3xl border border-cream-200 dark:border-darkbg-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-200 dark:border-darkbg-700 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Sleep Session Diary
          </h3>
          <span className="text-xs text-slate-400">{records.length} logs</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-50 dark:bg-darkbg-900/50 text-slate-500 uppercase tracking-wider font-semibold border-b border-cream-200 dark:border-darkbg-700">
              <tr>
                <th className="py-3 px-6">Bedtime</th>
                <th className="py-3 px-4">Wake Time</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Quality</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 dark:divide-darkbg-700 text-slate-700 dark:text-slate-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No sleep recorded yet. Click "Log Sleep Session".
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-cream-50/70 dark:hover:bg-darkbg-700/40 transition">
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      {new Date(r.bedtime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {new Date(r.wakeTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                      {(r.durationMinutes / 60).toFixed(1)} hrs ({r.durationMinutes}m)
                    </td>
                    <td className="py-3.5 px-4">
                      {r.sleepQuality ? (
                        <span className="text-amber-500">{'★'.repeat(r.sleepQuality)}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-darkbg-700 text-slate-600 dark:text-slate-400 uppercase">
                        {r.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-500">{r.notes || '-'}</td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteSleep(r.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transparency & Sleep Disclaimer */}
      <div className="p-4 bg-cream-100/70 dark:bg-darkbg-800/50 rounded-2xl border border-cream-200 dark:border-darkbg-700 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
        <p>
          <strong>Sleep Data Integrity:</strong> Without polysomnography or high-resolution EEG sensors, stage breakdowns (REM/deep sleep) are not simulated. Sleep logs record duration and perceived rest quality. Consult a sleep medicine physician for chronic insomnia or sleep apnea.
        </p>
      </div>

      {/* Log Sleep Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Sleep Session"
        subtitle="Log when you slept and woke up"
      >
        <form onSubmit={handleSaveSleep} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bedtime Date
              </label>
              <input
                type="date"
                required
                value={bedtimeDate}
                onChange={(e) => setBedtimeDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bedtime Hour
              </label>
              <input
                type="time"
                required
                value={bedtimeTime}
                onChange={(e) => setBedtimeTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Wake-up Date
              </label>
              <input
                type="date"
                required
                value={wakeDate}
                onChange={(e) => setWakeDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Wake-up Hour
              </label>
              <input
                type="time"
                required
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sleep Quality (1 to 5 Stars)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setSleepQuality(star)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border transition ${
                    sleepQuality >= star
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'bg-cream-50 dark:bg-darkbg-900 border-cream-300 dark:border-darkbg-700 text-slate-400'
                  }`}
                >
                  ★ {star}
                </button>
              ))}
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
              placeholder="e.g. Read for 15 mins, woke up feeling refreshed"
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
            >
              Save Sleep
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
