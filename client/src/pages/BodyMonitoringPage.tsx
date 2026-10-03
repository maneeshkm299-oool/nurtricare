import React, { useState, useEffect } from 'react';
import {
  Scale,
  Plus,
  Trash2,
  Edit2,
  TrendingDown,
  TrendingUp,
  Activity,
  HeartPulse,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Modal } from '../components/common/Modal.js';
import { Badge } from '../components/common/Badge.js';
import { ProgressBar } from '../components/common/ProgressBar.js';
import { api } from '../services/api.js';
import { BodyMeasurement, BMIData, HeartRateRecord } from '../types/index.js';

export const BodyMonitoringPage: React.FC = () => {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [bmiData, setBmiData] = useState<BMIData | null>(null);
  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [targetWeightKg, setTargetWeightKg] = useState<number | null>(null);
  const [heartRates, setHeartRates] = useState<HeartRateRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHrModalOpen, setIsHrModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Body form
  const [weightKg, setWeightKg] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [hipCm, setHipCm] = useState('');
  const [neckCm, setNeckCm] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [notes, setNotes] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);

  // HR form
  const [hrBpm, setHrBpm] = useState('72');
  const [hrType, setHrType] = useState<'resting' | 'exercise' | 'recovery' | 'general'>('resting');
  const [hrNotes, setHrNotes] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [bodyRes, hrRes] = await Promise.all([
        api.getBodyMeasurements(),
        api.getHeartRate()
      ]);
      setMeasurements(bodyRes.history || []);
      setBmiData(bodyRes.bmi);
      setHeightCm(bodyRes.heightCm);
      setTargetWeightKg(bodyRes.targetWeightKg);
      setHeartRates(hrRes.records || []);
    } catch (err) {
      console.error('Error loading body measurements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setWeightKg(measurements[0]?.weightKg?.toString() || '');
    setWaistCm(measurements[0]?.waistCm?.toString() || '');
    setHipCm(measurements[0]?.hipCm?.toString() || '');
    setNeckCm(measurements[0]?.neckCm?.toString() || '');
    setBodyFat(measurements[0]?.bodyFatPercentage?.toString() || '');
    setMuscleMass(measurements[0]?.muscleMassKg?.toString() || '');
    setNotes('');
    setRecordDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: BodyMeasurement) => {
    setEditingId(m.id);
    setWeightKg(m.weightKg?.toString() || '');
    setWaistCm(m.waistCm?.toString() || '');
    setHipCm(m.hipCm?.toString() || '');
    setNeckCm(m.neckCm?.toString() || '');
    setBodyFat(m.bodyFatPercentage?.toString() || '');
    setMuscleMass(m.muscleMassKg?.toString() || '');
    setNotes(m.notes || '');
    setRecordDate(m.recordedAt.split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSaveBody = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        weightKg: weightKg ? parseFloat(weightKg) : null,
        waistCm: waistCm ? parseFloat(waistCm) : null,
        hipCm: hipCm ? parseFloat(hipCm) : null,
        neckCm: neckCm ? parseFloat(neckCm) : null,
        bodyFatPercentage: bodyFat ? parseFloat(bodyFat) : null,
        muscleMassKg: muscleMass ? parseFloat(muscleMass) : null,
        recordedAt: new Date(recordDate).toISOString(),
        notes: notes || null,
        source: 'manual'
      };

      if (editingId) {
        await api.updateBodyMeasurement(editingId, payload);
      } else {
        await api.createBodyMeasurement(payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving measurement:', err);
    }
  };

  const handleDeleteBody = async (id: string) => {
    if (!confirm('Are you sure you want to delete this measurement?')) return;
    try {
      await api.deleteBodyMeasurement(id);
      loadData();
    } catch (err) {
      console.error('Error deleting measurement:', err);
    }
  };

  const handleSaveHr = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createHeartRate({
        heartRateBpm: parseInt(hrBpm),
        measurementType: hrType,
        source: 'manual',
        notes: hrNotes || null
      });
      setIsHrModalOpen(false);
      setHrNotes('');
      loadData();
    } catch (err) {
      console.error('Error saving heart rate:', err);
    }
  };

  const handleDeleteHr = async (id: string) => {
    if (!confirm('Delete this heart rate entry?')) return;
    try {
      await api.deleteHeartRate(id);
      loadData();
    } catch (err) {
      console.error('Error deleting heart rate:', err);
    }
  };

  const latest = measurements[0] || null;
  const oldest = measurements[measurements.length - 1] || null;
  const netChangeKg = latest?.weightKg && oldest?.weightKg && measurements.length > 1
    ? parseFloat((latest.weightKg - oldest.weightKg).toFixed(1))
    : 0;

  const chartData = [...measurements].reverse().map(m => ({
    date: m.recordedAt.slice(5, 10),
    weight: m.weightKg,
    waist: m.waistCm,
    bodyFat: m.bodyFatPercentage
  }));

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Scale className="w-7 h-7 text-brand-600" />
            Body Composition & Measurements
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track weight, circumferences, BMI, and cardiovascular resting pulse.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsHrModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-800 transition"
          >
            <HeartPulse className="w-4 h-4" />
            <span>Log Pulse</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Measurement</span>
          </button>
        </div>
      </div>

      {/* Top Cards: Weight, BMI, Target, Net Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Latest Weight */}
        <div className="bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>CURRENT WEIGHT</span>
            <Badge variant="brand">{latest?.source || 'manual'}</Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {latest?.weightKg || '--'}
            </span>
            <span className="text-sm font-medium text-slate-500">kg</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {latest ? `Recorded on ${latest.recordedAt.split('T')[0]}` : 'No entries yet'}
          </p>
        </div>

        {/* BMI Calculator Card */}
        <div className="bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>BODY MASS INDEX</span>
            {bmiData && (
              <Badge
                variant={
                  bmiData.category === 'Normal' ? 'success' : bmiData.category === 'Overweight' ? 'warning' : 'danger'
                }
              >
                {bmiData.category}
              </Badge>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {bmiData ? bmiData.bmi : '--'}
            </span>
            <span className="text-xs font-medium text-slate-500">kg/m²</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Height: {heightCm || '--'} cm • Normal range: {bmiData?.healthyWeightRangeKg.min}-{bmiData?.healthyWeightRangeKg.max} kg
          </p>
        </div>

        {/* Target Weight Goal */}
        <div className="bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>TARGET WEIGHT</span>
            <span className="text-xs font-bold text-brand-600">Goal</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {targetWeightKg || '--'}
            </span>
            <span className="text-sm font-medium text-slate-500">kg</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {latest?.weightKg && targetWeightKg
              ? `${Math.abs(parseFloat((latest.weightKg - targetWeightKg).toFixed(1)))} kg to goal`
              : 'Set target weight in profile'}
          </p>
        </div>

        {/* Net Progress */}
        <div className="bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>TOTAL JOURNEY CHANGE</span>
            {netChangeKg < 0 ? (
              <TrendingDown className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingUp className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {netChangeKg > 0 ? `+${netChangeKg}` : netChangeKg}
            </span>
            <span className="text-sm font-medium text-slate-500">kg</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Across {measurements.length} logged check-ins
          </p>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 border border-cream-200 dark:border-darkbg-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Weight & Waist Circumference Trend
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Historical measurements over time</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
              <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                  fontSize: '12px'
                }}
              />
              <Line type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} name="Weight (kg)" />
              <Line type="monotone" dataKey="waist" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="Waist (cm)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Measurement History Table */}
      <div className="bg-white dark:bg-darkbg-800 rounded-3xl border border-cream-200 dark:border-darkbg-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-200 dark:border-darkbg-700 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Recorded Measurement History
          </h3>
          <span className="text-xs text-slate-400">{measurements.length} total entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-50 dark:bg-darkbg-900/50 text-slate-500 uppercase tracking-wider font-semibold border-b border-cream-200 dark:border-darkbg-700">
              <tr>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-4">Weight</th>
                <th className="py-3 px-4">Waist</th>
                <th className="py-3 px-4">Hip</th>
                <th className="py-3 px-4">Neck</th>
                <th className="py-3 px-4">Body Fat %</th>
                <th className="py-3 px-4">Muscle Mass</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 dark:divide-darkbg-700 text-slate-700 dark:text-slate-200">
              {measurements.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No measurements recorded yet. Click "New Measurement" above.
                  </td>
                </tr>
              ) : (
                measurements.map((m) => (
                  <tr key={m.id} className="hover:bg-cream-50/70 dark:hover:bg-darkbg-700/40 transition">
                    <td className="py-3.5 px-6 font-medium whitespace-nowrap">{m.recordedAt.split('T')[0]}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {m.weightKg ? `${m.weightKg} kg` : '-'}
                    </td>
                    <td className="py-3.5 px-4">{m.waistCm ? `${m.waistCm} cm` : '-'}</td>
                    <td className="py-3.5 px-4">{m.hipCm ? `${m.hipCm} cm` : '-'}</td>
                    <td className="py-3.5 px-4">{m.neckCm ? `${m.neckCm} cm` : '-'}</td>
                    <td className="py-3.5 px-4">{m.bodyFatPercentage ? `${m.bodyFatPercentage}%` : '-'}</td>
                    <td className="py-3.5 px-4">{m.muscleMassKg ? `${m.muscleMassKg} kg` : '-'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-slate-100 dark:bg-darkbg-700 text-slate-600 dark:text-slate-400">
                        {m.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-500">{m.notes || '-'}</td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-cream-100 dark:hover:bg-darkbg-600 transition mr-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBody(m.id)}
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

      {/* Heart Rate Section */}
      <div className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 border border-cream-200 dark:border-darkbg-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-500" />
              Heart Rate & Pulse Readings
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Resting, exercise, and recovery measurements. (Non-clinical lifestyle data)
            </p>
          </div>
          <button
            onClick={() => setIsHrModalOpen(true)}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-800 transition"
          >
            + Add Pulse
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {heartRates.slice(0, 8).map((hr) => (
            <div
              key={hr.id}
              className="p-3.5 rounded-2xl bg-cream-50 dark:bg-darkbg-900 border border-cream-200 dark:border-darkbg-700 flex items-center justify-between"
            >
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100">
                    {hr.heartRateBpm}
                  </span>
                  <span className="text-[10px] text-slate-400">bpm</span>
                </div>
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 capitalize">
                  {hr.measurementType}
                </span>
                <p className="text-[10px] text-slate-400">{hr.recordedAt.split('T')[0]}</p>
              </div>
              <button
                onClick={() => handleDeleteHr(hr.id)}
                className="text-slate-300 hover:text-rose-500 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {heartRates.length === 0 && (
            <p className="text-xs text-slate-400 col-span-4 py-4 text-center">
              No heart rate logs yet. Log your morning resting pulse!
            </p>
          )}
        </div>
      </div>

      {/* Disclaimers */}
      <div className="p-4 bg-cream-100/70 dark:bg-darkbg-800/50 rounded-2xl border border-cream-200 dark:border-darkbg-700 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
        <p>
          <strong>Clinical Disclaimer:</strong> Body Mass Index (BMI) is calculated as weight (kg) / height (m)². It is a general screening indicator and does not directly calculate body fat percentage or cardiovascular fitness. Only voluntary measurements and verified device imports are displayed.
        </p>
      </div>

      {/* Add / Edit Body Measurement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Measurement' : 'Record Body Measurements'}
        subtitle="Log your body metrics with timestamp"
      >
        <form onSubmit={handleSaveBody} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Weight (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="e.g. 75.5"
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
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Waist (cm)
              </label>
              <input
                type="number"
                step="0.5"
                value={waistCm}
                onChange={(e) => setWaistCm(e.target.value)}
                placeholder="85"
                className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Hip (cm)
              </label>
              <input
                type="number"
                step="0.5"
                value={hipCm}
                onChange={(e) => setHipCm(e.target.value)}
                placeholder="98"
                className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Neck (cm)
              </label>
              <input
                type="number"
                step="0.5"
                value={neckCm}
                onChange={(e) => setNeckCm(e.target.value)}
                placeholder="37"
                className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Body Fat % (Optional)
              </label>
              <input
                type="number"
                step="0.1"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="22.5"
                className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Muscle Mass (kg) (Optional)
              </label>
              <input
                type="number"
                step="0.1"
                value={muscleMass}
                onChange={(e) => setMuscleMass(e.target.value)}
                placeholder="56.0"
                className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
              />
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
              placeholder="e.g. Fasted morning check-in"
              className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-cream-200 dark:border-darkbg-700">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20"
            >
              {editingId ? 'Update Record' : 'Save Measurement'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Log Heart Rate Modal */}
      <Modal
        isOpen={isHrModalOpen}
        onClose={() => setIsHrModalOpen(false)}
        title="Log Heart Rate Pulse"
        subtitle="Record manual pulse reading"
      >
        <form onSubmit={handleSaveHr} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Heart Rate (BPM) *
              </label>
              <input
                type="number"
                min="35"
                max="220"
                required
                value={hrBpm}
                onChange={(e) => setHrBpm(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Measurement Type
              </label>
              <select
                value={hrType}
                onChange={(e: any) => setHrType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-sm"
              >
                <option value="resting">Resting Pulse</option>
                <option value="exercise">During Exercise</option>
                <option value="recovery">Post-workout Recovery</option>
                <option value="general">General Check</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={hrNotes}
              onChange={(e) => setHrNotes(e.target.value)}
              placeholder="e.g. Taken upon waking up"
              className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-cream-200 dark:border-darkbg-700">
            <button
              type="button"
              onClick={() => setIsHrModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
            >
              Save Pulse
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
