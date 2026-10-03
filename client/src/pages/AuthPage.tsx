import React, { useState } from 'react';
import { Leaf, HeartPulse, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [heightCm, setHeightCm] = useState('175');
  const [initialWeightKg, setInitialWeightKg] = useState('75');
  const [targetWeightKg, setTargetWeightKg] = useState('70');
  const [fitnessGoal, setFitnessGoal] = useState('weight_loss');
  const [activityLevel, setActivityLevel] = useState('moderately_active');
  const [dietaryPreference, setDietaryPreference] = useState('vegetarian');

  const { login, register, quickDemoLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({
          name,
          email,
          password,
          heightCm: parseFloat(heightCm) || undefined,
          initialWeightKg: parseFloat(initialWeightKg) || undefined,
          targetWeightKg: parseFloat(targetWeightKg) || undefined,
          fitnessGoal,
          activityLevel,
          dietaryPreference,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      await quickDemoLogin();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-darkbg-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* NutriCare Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-xl shadow-brand-500/25 relative mb-4">
          <Leaf className="w-9 h-9 stroke-[2.2]" />
          <HeartPulse className="w-5 h-5 text-amber-300 absolute -bottom-1 -right-1" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          NutriCare
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Complete Body Health, Nutrition & Activity Monitoring
        </p>

        {/* Quick Demo Access banner */}
        <div className="mt-5 p-3.5 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-2xl flex items-center justify-between text-left">
          <div>
            <p className="text-xs font-bold text-brand-900 dark:text-brand-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              Instant Demo Experience
            </p>
            <p className="text-[11px] text-brand-700/80 dark:text-brand-400/80">
              Pre-loaded with verified Indian food records & sample metrics
            </p>
          </div>
          <button
            type="button"
            onClick={handleDemo}
            disabled={loading}
            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1 shrink-0"
          >
            <span>Explore Demo</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-darkbg-800 py-8 px-6 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-3xl border border-cream-200 dark:border-darkbg-700 sm:px-10">
          {/* Tabs */}
          <div className="flex border-b border-cream-200 dark:border-darkbg-700 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition ${
                isLogin
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition ${
                !isLogin
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {!isLogin && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-slate-800 dark:text-slate-100 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={initialWeightKg}
                      onChange={(e) => setInitialWeightKg(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-slate-800 dark:text-slate-100 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Target (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={targetWeightKg}
                      onChange={(e) => setTargetWeightKg(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-slate-800 dark:text-slate-100 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Fitness Goal
                    </label>
                    <select
                      value={fitnessGoal}
                      onChange={(e) => setFitnessGoal(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-slate-800 dark:text-slate-100 text-xs"
                    >
                      <option value="weight_loss">Weight loss</option>
                      <option value="weight_gain">Weight gain</option>
                      <option value="weight_maintenance">Weight maintenance</option>
                      <option value="muscle_building">Muscle building</option>
                      <option value="improve_endurance">Improve endurance</option>
                      <option value="maintain_general_wellness">General wellness</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Dietary Preference
                    </label>
                    <select
                      value={dietaryPreference}
                      onChange={(e) => setDietaryPreference(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-slate-800 dark:text-slate-100 text-xs"
                    >
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="non_vegetarian">Non-vegetarian</option>
                      <option value="eggetarian">Eggetarian</option>
                      <option value="jain">Jain</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-md shadow-brand-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In to Dashboard' : 'Complete Setup & Enter'}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <span className="text-xs text-slate-500">
                Demo user: <code className="text-brand-600 font-mono">demo@nutricare.com</code> / <code className="text-brand-600 font-mono">Password123!</code>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
