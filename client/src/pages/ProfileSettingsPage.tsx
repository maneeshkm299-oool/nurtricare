import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Save,
  Download,
  Trash2,
  UploadCloud,
  FileSpreadsheet,
  FileJson,
  Shield,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Modal } from '../components/common/Modal.js';
import { Badge } from '../components/common/Badge.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const ProfileSettingsPage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profile form states
  const [name, setName] = useState(user?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('moderately_active');
  const [fitnessGoal, setFitnessGoal] = useState('weight_loss');
  const [dietaryPreference, setDietaryPreference] = useState('vegetarian');
  const [allergies, setAllergies] = useState('');
  const [foodDislikes, setFoodDislikes] = useState('');
  const [preferredUnits, setPreferredUnits] = useState('metric');
  const [timeZone, setTimeZone] = useState('Asia/Kolkata');

  // CSV Import state
  const [csvType, setCsvType] = useState<'measurements' | 'activities'>('measurements');
  const [csvContent, setCsvContent] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Delete Account Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const loadProfile = async () => {
    try {
      const res = await api.getProfile();
      if (res) {
        setName(res.name || '');
        if (res.profile) {
          setDateOfBirth(res.profile.dateOfBirth ? res.profile.dateOfBirth.split('T')[0] : '');
          setHeightCm(res.profile.heightCm?.toString() || '');
          setGender(res.profile.gender || 'male');
          setActivityLevel(res.profile.activityLevel || 'moderately_active');
          setFitnessGoal(res.profile.fitnessGoal || 'weight_loss');
          setDietaryPreference(res.profile.dietaryPreference || 'vegetarian');
          setAllergies(res.profile.allergies || '');
          setFoodDislikes(res.profile.foodDislikes || '');
          setPreferredUnits(res.profile.preferredUnits || 'metric');
          setTimeZone(res.profile.timeZone || 'Asia/Kolkata');
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      await api.updateProfile({
        name,
        dateOfBirth: dateOfBirth || null,
        heightCm: heightCm ? parseFloat(heightCm) : null,
        gender,
        activityLevel,
        fitnessGoal,
        dietaryPreference,
        allergies: allergies || null,
        foodDislikes: foodDislikes || null,
        preferredUnits,
        timeZone
      });
      setSaveSuccess(true);
      await refreshUser();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportStatus('Processing import...');
    try {
      const res = await api.importCsvData(csvType, csvContent);
      setImportStatus(res.message);
      setTimeout(() => {
        setIsCsvModalOpen(false);
        setImportStatus(null);
        setCsvContent('');
      }, 2000);
    } catch (err: any) {
      setImportStatus(`Import failed: ${err.message}`);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      await api.deleteAccount();
      logout();
    } catch (err) {
      console.error('Error deleting account:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
          <UserCog className="w-7 h-7 text-brand-600" />
          Profile, Devices & Privacy Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Control your biometric parameters, preferences, health integrations, and privacy sovereignty.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>Profile and health preferences updated successfully!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-200 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Form */}
        <div className="lg:col-span-2 bg-white dark:bg-darkbg-800 rounded-3xl p-6 sm:p-8 border border-cream-200 dark:border-darkbg-700 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 pb-3 border-b border-cream-200 dark:border-darkbg-700">
            Personal Health Profile
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address (Immutable)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2 rounded-xl bg-cream-100 dark:bg-darkbg-950 border border-cream-200 dark:border-darkbg-800 text-xs text-slate-400 cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Biological Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Daily Physical Activity Level
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs font-medium"
                >
                  <option value="sedentary">Sedentary (desk work, minimal activity)</option>
                  <option value="lightly_active">Lightly Active (1-3 light sessions/week)</option>
                  <option value="moderately_active">Moderately Active (3-5 workouts/week)</option>
                  <option value="very_active">Very Active (6-7 intense workouts/week)</option>
                  <option value="extra_active">Extra Active (athletes or physical labor)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Fitness Goal
                </label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs font-medium"
                >
                  <option value="weight_loss">Weight loss (caloric deficit)</option>
                  <option value="weight_gain">Weight gain (controlled surplus)</option>
                  <option value="weight_maintenance">Weight maintenance</option>
                  <option value="muscle_building">Muscle building (hypertrophy)</option>
                  <option value="improve_endurance">Improve endurance</option>
                  <option value="improve_flexibility">Improve flexibility & mobility</option>
                  <option value="maintain_general_wellness">Maintain general wellness</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dietary Preference
                </label>
                <select
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs font-medium"
                >
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="non_vegetarian">Non-vegetarian</option>
                  <option value="eggetarian">Eggetarian</option>
                  <option value="jain">Jain (No root vegetables)</option>
                  <option value="pescatarian">Pescatarian</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Food Allergies (Excluded from Meal Plans)
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. peanuts, dairy, gluten"
                  className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Disliked Foods
              </label>
              <input
                type="text"
                value={foodDislikes}
                onChange={(e) => setFoodDislikes(e.target.value)}
                placeholder="e.g. bitter gourd, mushrooms"
                className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Side Panel: Integrations & Privacy */}
        <div className="space-y-6">
          {/* Health Device & CSV Integration */}
          <div className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 border border-cream-200 dark:border-darkbg-700 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-brand-600" />
              Device Integration & CSV
            </h3>
            <p className="text-xs text-slate-500">
              Import historical fitness logs from spreadsheets or companion devices.
            </p>

            <button
              onClick={() => setIsCsvModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 rounded-xl text-xs font-bold border border-brand-200 dark:border-brand-800 transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import Data from CSV</span>
            </button>

            <div className="p-3 bg-cream-50 dark:bg-darkbg-900 rounded-2xl border border-cream-200 dark:border-darkbg-700 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Android Health Connect</span>
                <Badge variant="brand">Bridge Ready</Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Direct native sync bridge is configured for deployment with an Android wrapper.
              </p>
            </div>
          </div>

          {/* Privacy & Account Controls */}
          <div className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 border border-cream-200 dark:border-darkbg-700 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Privacy & Data Control
            </h3>
            <p className="text-xs text-slate-500">
              You own your health data. Export records or purge your account permanently.
            </p>

            <div className="space-y-2">
              <button
                onClick={async () => await api.downloadJsonArchive()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 dark:bg-darkbg-700 dark:hover:bg-darkbg-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
              >
                <FileJson className="w-4 h-4" />
                <span>Download All Data (JSON)</span>
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition border border-rose-200 dark:border-rose-900/50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account & Records</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Import Modal */}
      <Modal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        title="Import Health Data via CSV"
        subtitle="Paste standard CSV content to import"
      >
        <form onSubmit={handleImportCsv} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Data Category
            </label>
            <select
              value={csvType}
              onChange={(e: any) => setCsvType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs font-bold"
            >
              <option value="measurements">Body Measurements (Date, Weight, Waist, Fat)</option>
              <option value="activities">Physical Activities (Date, Activity, Duration, Steps, Calories)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              CSV Text Content
            </label>
            <textarea
              rows={6}
              required
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder={
                csvType === 'measurements'
                  ? 'Date,Weight,Waist,Fat\n2026-09-15,76.5,86,23.5\n2026-09-22,75.8,85,23.0'
                  : 'Date,Activity,Duration,Steps,Calories\n2026-09-28,walking,45,5200,210'
              }
              className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs font-mono"
            />
          </div>

          {importStatus && (
            <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
              {importStatus}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-cream-200 dark:border-darkbg-700">
            <button
              type="button"
              onClick={() => setIsCsvModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold"
            >
              Run CSV Import
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Account Deletion"
        subtitle="This action is irreversible and permanently removes all health records"
      >
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800 dark:text-rose-200">
              <p className="font-bold">Permanent Loss of Health History</p>
              <p className="mt-0.5">
                All body measurements, workout sessions, meal records, diet plans, and achievement streaks will be permanently erased from the database.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Type <strong>DELETE</strong> to confirm:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-rose-300 text-xs font-bold"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-cream-200 dark:border-darkbg-700">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteConfirmText !== 'DELETE'}
              onClick={handleDeleteAccount}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold disabled:opacity-40"
            >
              Permanently Delete Everything
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
