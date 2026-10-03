import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Plus,
  Trash2,
  Clock,
  Flame,
  Award,
  Calendar,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Modal } from '../components/common/Modal.js';
import { Badge } from '../components/common/Badge.js';
import { api } from '../services/api.js';
import { Workout, WorkoutExercise } from '../types/index.js';

const workoutCategories = [
  { id: 'strength', name: 'Strength Training', icon: '🏋️‍♂️' },
  { id: 'cardio', name: 'Cardio & Intervals', icon: '🏃‍♂️' },
  { id: 'flexibility', name: 'Flexibility & Stretching', icon: '🤸‍♂️' },
  { id: 'yoga', name: 'Yoga & Mindfulness', icon: '🧘‍♂️' },
  { id: 'mobility', name: 'Mobility & Recovery', icon: '🔄' },
  { id: 'endurance', name: 'Endurance', icon: '🚴‍♂️' },
  { id: 'home_workout', name: 'Home Workout', icon: '🏠' },
];

export const WorkoutsPage: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [workoutType, setWorkoutType] = useState('strength');
  const [durationMinutes, setDurationMinutes] = useState('45');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);

  // Exercises in current modal
  const [exercises, setExercises] = useState<WorkoutExercise[]>([
    { exerciseName: 'Barbell Squats', sets: 4, repetitions: 10, weightKg: 60 }
  ]);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const res = await api.getWorkouts();
      setWorkouts(res.workouts || []);
      if (res.workouts && res.workouts.length > 0) {
        setExpandedWorkoutId(res.workouts[0].id);
      }
    } catch (err) {
      console.error('Error loading workouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const handleAddExerciseRow = () => {
    setExercises(prev => [
      ...prev,
      { exerciseName: '', sets: 3, repetitions: 10, weightKg: 0 }
    ]);
  };

  const handleRemoveExerciseRow = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index: number, field: keyof WorkoutExercise, value: any) => {
    setExercises(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSaveWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validExercises = exercises.filter(ex => ex.exerciseName.trim().length > 0);
      await api.createWorkout({
        title,
        workoutType,
        durationMinutes: parseInt(durationMinutes) || 45,
        startedAt: new Date(workoutDate).toISOString(),
        notes: workoutNotes || null,
        exercises: validExercises
      });
      setIsModalOpen(false);
      setTitle('');
      setWorkoutNotes('');
      setExercises([{ exerciseName: '', sets: 3, repetitions: 10, weightKg: 0 }]);
      loadWorkouts();
    } catch (err) {
      console.error('Error saving workout:', err);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;
    try {
      await api.deleteWorkout(id);
      loadWorkouts();
    } catch (err) {
      console.error('Error deleting workout:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Dumbbell className="w-7 h-7 text-brand-600" />
            Exercise & Workout Monitoring
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Log resistance training, sets, repetitions, weights lifted, and cardio sessions.
          </p>
        </div>
        <button
          onClick={() => {
            setTitle('');
            setExercises([{ exerciseName: '', sets: 3, repetitions: 10, weightKg: 0 }]);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Workout</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>TOTAL SESSIONS</span>
            <Badge variant="brand">All time</Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {workouts.length}
            </span>
            <span className="text-sm font-medium text-slate-500">workouts</span>
          </div>
        </div>

        <div className="bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>WEEKLY FREQUENCY</span>
            <span className="text-xs font-bold text-brand-600">Goal: 4/week</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {workouts.filter(w => new Date(w.startedAt).getTime() > Date.now() - 7 * 86400000).length}
            </span>
            <span className="text-sm font-medium text-slate-500">this week</span>
          </div>
        </div>

        <div className="bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>AVERAGE DURATION</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {workouts.length > 0 ? Math.round(workouts.reduce((s, w) => s + w.durationMinutes, 0) / workouts.length) : 0}
            </span>
            <span className="text-sm font-medium text-slate-500">minutes</span>
          </div>
        </div>
      </div>

      {/* Workouts History List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          Saved Workout History
        </h3>

        {workouts.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-darkbg-800 rounded-3xl border border-cream-200 dark:border-darkbg-700">
            <Dumbbell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No workout records found. Click "Record New Workout" to start.</p>
          </div>
        ) : (
          workouts.map((w) => {
            const isExpanded = expandedWorkoutId === w.id;
            const category = workoutCategories.find(c => c.id === w.workoutType.toLowerCase());

            return (
              <div
                key={w.id}
                className="bg-white dark:bg-darkbg-800 rounded-3xl border border-cream-200 dark:border-darkbg-700 shadow-sm overflow-hidden"
              >
                <div
                  onClick={() => setExpandedWorkoutId(isExpanded ? null : w.id)}
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-cream-50/70 dark:hover:bg-darkbg-700/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category?.icon || '🏋️‍♂️'}</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {w.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {w.startedAt.split('T')[0]} • {w.durationMinutes} mins • {w.exercises?.length || 0} exercises
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="brand">{category?.name || w.workoutType}</Badge>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkout(w.id);
                      }}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 py-4 border-t border-cream-100 dark:border-darkbg-700 bg-cream-50/40 dark:bg-darkbg-900/30">
                    {w.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-3">
                        "{w.notes}"
                      </p>
                    )}

                    <div className="space-y-2">
                      <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Exercise Breakdown
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {(w.exercises || []).map((ex, i) => (
                          <div
                            key={i}
                            className="p-3 bg-white dark:bg-darkbg-800 rounded-xl border border-cream-200 dark:border-darkbg-700 text-xs"
                          >
                            <p className="font-bold text-slate-800 dark:text-slate-100">{ex.exerciseName}</p>
                            <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                              {ex.sets} sets {ex.repetitions ? `× ${ex.repetitions} reps` : ''} {ex.weightKg ? `@ ${ex.weightKg} kg` : ''} {ex.durationSeconds ? `• ${ex.durationSeconds}s` : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Clinical Disclaimer */}
      <div className="p-4 bg-cream-100/70 dark:bg-darkbg-800/50 rounded-2xl border border-cream-200 dark:border-darkbg-700 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
        <p>
          <strong>Exercise Guidance Disclaimer:</strong> Workout logs and suggestions are designed for progressive lifestyle fitness tracking. NutriCare does not prescribe exercise as medical treatment for pathological conditions or replace licensed physical therapy.
        </p>
      </div>

      {/* Record Workout Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Workout Session"
        subtitle="Log exercises, sets, weights, and repetitions"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveWorkout} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Workout Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Upper Body Hypertrophy"
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-sm"
              >
                {workoutCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
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
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
              />
            </div>
          </div>

          {/* Exercises Dynamic List */}
          <div className="space-y-2 pt-2 border-t border-cream-200 dark:border-darkbg-700">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Exercises Performed
              </label>
              <button
                type="button"
                onClick={handleAddExerciseRow}
                className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline"
              >
                + Add Exercise
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {exercises.map((ex, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-cream-50 dark:bg-darkbg-900 p-2 rounded-xl border border-cream-200 dark:border-darkbg-700 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Exercise Name (e.g. Bench Press)"
                    value={ex.exerciseName}
                    onChange={(e) => handleExerciseChange(idx, 'exerciseName', e.target.value)}
                    className="flex-1 px-2 py-1 rounded bg-white dark:bg-darkbg-800 border border-cream-300 dark:border-darkbg-700 text-xs"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Sets"
                    title="Sets"
                    value={ex.sets}
                    onChange={(e) => handleExerciseChange(idx, 'sets', parseInt(e.target.value) || 1)}
                    className="w-16 px-1.5 py-1 rounded bg-white dark:bg-darkbg-800 border text-center text-xs"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Reps"
                    title="Reps"
                    value={ex.repetitions || ''}
                    onChange={(e) => handleExerciseChange(idx, 'repetitions', parseInt(e.target.value) || 0)}
                    className="w-16 px-1.5 py-1 rounded bg-white dark:bg-darkbg-800 border text-center text-xs"
                  />
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="Weight (kg)"
                    title="Weight (kg)"
                    value={ex.weightKg || ''}
                    onChange={(e) => handleExerciseChange(idx, 'weightKg', parseFloat(e.target.value) || 0)}
                    className="w-20 px-1.5 py-1 rounded bg-white dark:bg-darkbg-800 border text-center text-xs"
                  />
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExerciseRow(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Workout Notes
            </label>
            <input
              type="text"
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="e.g. Great energy, felt strong on last set"
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
              Save Workout
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
