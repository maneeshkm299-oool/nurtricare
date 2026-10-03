import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Plus,
  Search,
  Trash2,
  Sparkles,
  BookOpen,
  PieChart as PieIcon,
  CheckCircle,
  AlertCircle,
  Apple,
  Coffee,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';
import { Modal } from '../components/common/Modal.js';
import { Badge } from '../components/common/Badge.js';
import { ProgressBar } from '../components/common/ProgressBar.js';
import { api } from '../services/api.js';
import { Food, MealLog, DietPlan } from '../types/index.js';

const mealCategories = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee, desc: 'Energize your morning' },
  { id: 'morning_snack', label: 'Morning Snack', icon: Apple, desc: 'Mid-morning hydration & fruits' },
  { id: 'lunch', label: 'Lunch', icon: Sun, desc: 'Main midday meal' },
  { id: 'evening_snack', label: 'Evening Snack', icon: Coffee, desc: 'Post-workout or evening tea' },
  { id: 'dinner', label: 'Dinner', icon: Moon, desc: 'Light, restorative dinner' },
];

export const NutritionDietPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'diary' | 'planner' | 'database'>('diary');
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [nutritionSummary, setNutritionSummary] = useState<any>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Search & Log Food Modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState('1');

  // Custom Food Modal
  const [isCustomFoodModalOpen, setIsCustomFoodModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customServingSize, setCustomServingSize] = useState('1');
  const [customServingUnit, setCustomServingUnit] = useState('bowl');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customFiber, setCustomFiber] = useState('');
  const [customCategory, setCustomCategory] = useState('grain');
  const [customClassification, setCustomClassification] = useState('veg');

  // Generate Diet Plan Modal
  const [isGeneratePlanOpen, setIsGeneratePlanOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mealsRes, summaryRes, foodsRes, plansRes] = await Promise.all([
        api.getMeals(selectedDate),
        api.getNutritionSummary(selectedDate),
        api.getFoods({ q: searchQuery }),
        api.getDietPlans()
      ]);
      setMeals(mealsRes.meals || []);
      setNutritionSummary(summaryRes);
      setFoods(foodsRes.foods || []);
      setDietPlans(plansRes.plans || []);
    } catch (err) {
      console.error('Error loading nutrition data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      try {
        const res = await api.getFoods({ q: searchQuery });
        setFoods(res.foods || []);
      } catch (e) {
        console.error(e);
      }
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleOpenLogModal = (mealType: string) => {
    setSelectedMealType(mealType);
    setSelectedFood(null);
    setQuantity('1');
    setSearchQuery('');
    setIsLogModalOpen(true);
  };

  const handleAddMealItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) return;

    try {
      const q = parseFloat(quantity) || 1;
      const factor = q / (selectedFood.servingSize || 1);

      const payload = {
        mealType: selectedMealType,
        loggedAt: new Date(selectedDate).toISOString(),
        items: [
          {
            foodId: selectedFood.id,
            foodNameSnapshot: selectedFood.name,
            quantity: q,
            servingUnit: selectedFood.servingUnit,
            calories: Math.round(selectedFood.calories * factor),
            proteinGrams: parseFloat((selectedFood.proteinGrams * factor).toFixed(1)),
            carbohydrateGrams: parseFloat((selectedFood.carbohydrateGrams * factor).toFixed(1)),
            fatGrams: parseFloat((selectedFood.fatGrams * factor).toFixed(1)),
            fiberGrams: parseFloat((selectedFood.fiberGrams * factor).toFixed(1)),
          }
        ]
      };

      await api.createMeal(payload);
      setIsLogModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error logging meal item:', err);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      await api.deleteMeal(id);
      loadData();
    } catch (err) {
      console.error('Error deleting meal:', err);
    }
  };

  const handleCreateCustomFood = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCustomFood({
        name: customName,
        servingSize: parseFloat(customServingSize) || 1,
        servingUnit: customServingUnit,
        calories: parseFloat(customCalories) || 0,
        proteinGrams: parseFloat(customProtein) || 0,
        carbohydrateGrams: parseFloat(customCarbs) || 0,
        fatGrams: parseFloat(customFat) || 0,
        fiberGrams: parseFloat(customFiber) || 0,
        category: customCategory,
        dietaryClassification: customClassification
      });
      setIsCustomFoodModalOpen(false);
      // Reset form
      setCustomName('');
      setCustomCalories('');
      setCustomProtein('');
      setCustomCarbs('');
      setCustomFat('');
      setCustomFiber('');
      loadData();
    } catch (err) {
      console.error('Error creating custom food:', err);
    }
  };

  const handleGeneratePlan = async () => {
    try {
      setGenerating(true);
      await api.generateDietPlan({});
      setIsGeneratePlanOpen(false);
      loadData();
    } catch (err) {
      console.error('Error generating plan:', err);
    } finally {
      setGenerating(false);
    }
  };

  const consumed = nutritionSummary?.consumed || { calories: 0, proteinGrams: 0, carbohydrateGrams: 0, fatGrams: 0, fiberGrams: 0 };
  const targets = nutritionSummary?.targets || { dailyCalories: 2000, proteinGrams: 120, carbohydrateGrams: 240, fatGrams: 55, fiberGrams: 30 };
  const remainingCals = nutritionSummary?.remainingCalories ?? 2000;

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Utensils className="w-7 h-7 text-amber-500" />
            Nutrition & Food Diary
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Indian food database, verified macro snapshots, and personalized dietitian recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub tabs */}
          <div className="bg-cream-200/70 dark:bg-darkbg-800 p-1 rounded-2xl flex items-center border border-cream-300 dark:border-darkbg-700">
            <button
              onClick={() => setActiveSubTab('diary')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeSubTab === 'diary'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Food Diary
            </button>
            <button
              onClick={() => setActiveSubTab('planner')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                activeSubTab === 'planner'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Diet Planner</span>
            </button>
            <button
              onClick={() => setActiveSubTab('database')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeSubTab === 'database'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Food Library
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'diary' && (
        <>
          {/* Date Selector & Day Macro Summary */}
          <div className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 border border-cream-200 dark:border-darkbg-700 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cream-200 dark:border-darkbg-700 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-500 uppercase">View Log Date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs font-semibold"
                />
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="text-slate-500">
                  Target: <strong>{targets.dailyCalories} kcal</strong>
                </span>
                <span className="text-brand-600 font-bold">
                  Remaining: {remainingCals} kcal
                </span>
              </div>
            </div>

            {/* 4 Macro Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-cream-50 dark:bg-darkbg-900 border border-cream-200 dark:border-darkbg-700">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Calories</span>
                  <span className="text-brand-600">{consumed.calories} / {targets.dailyCalories} kcal</span>
                </div>
                <ProgressBar value={consumed.calories} max={targets.dailyCalories} color="bg-brand-500" height="h-2" showPercent={false} />
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 dark:bg-darkbg-900 border border-cream-200 dark:border-darkbg-700">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Protein</span>
                  <span className="text-emerald-600">{consumed.proteinGrams} / {targets.proteinGrams}g</span>
                </div>
                <ProgressBar value={consumed.proteinGrams} max={targets.proteinGrams} color="bg-emerald-500" height="h-2" showPercent={false} />
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 dark:bg-darkbg-900 border border-cream-200 dark:border-darkbg-700">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Carbs</span>
                  <span className="text-amber-600">{consumed.carbohydrateGrams} / {targets.carbohydrateGrams}g</span>
                </div>
                <ProgressBar value={consumed.carbohydrateGrams} max={targets.carbohydrateGrams} color="bg-amber-500" height="h-2" showPercent={false} />
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 dark:bg-darkbg-900 border border-cream-200 dark:border-darkbg-700">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Fats</span>
                  <span className="text-rose-600">{consumed.fatGrams} / {targets.fatGrams}g</span>
                </div>
                <ProgressBar value={consumed.fatGrams} max={targets.fatGrams} color="bg-rose-500" height="h-2" showPercent={false} />
              </div>
            </div>
          </div>

          {/* Meals List by Category */}
          <div className="space-y-4">
            {mealCategories.map((cat) => {
              const Icon = cat.icon;
              const catMeals = meals.filter((m) => m.mealType === cat.id);
              const catCalories = catMeals.reduce(
                (sum, m) => sum + m.items.reduce((s, i) => s + i.calories, 0),
                0
              );

              return (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-darkbg-800 rounded-3xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {cat.label}
                        </h4>
                        <p className="text-[11px] text-slate-400">{cat.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {catCalories} kcal
                      </span>
                      <button
                        onClick={() => handleOpenLogModal(cat.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 rounded-xl text-xs font-bold border border-brand-200 dark:border-brand-800 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Food</span>
                      </button>
                    </div>
                  </div>

                  {catMeals.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2 pl-2">
                      No foods logged for {cat.label.toLowerCase()} yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-cream-100 dark:divide-darkbg-700 mt-2">
                      {catMeals.map((meal) => (
                        <div key={meal.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            {meal.items.map((item, idx) => (
                              <div key={idx} className="flex items-baseline gap-2">
                                <span className="font-semibold text-slate-800 dark:text-slate-100">
                                  {item.foodNameSnapshot}
                                </span>
                                <span className="text-slate-400">
                                  ({item.quantity} {item.servingUnit})
                                </span>
                                <span className="text-slate-500 font-mono text-[11px]">
                                  P: {item.proteinGrams}g • C: {item.carbohydrateGrams}g • F: {item.fatGrams}g
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-amber-600">
                              {meal.items.reduce((s, i) => s + i.calories, 0)} kcal
                            </span>
                            <button
                              onClick={() => handleDeleteMeal(meal.id)}
                              className="text-slate-300 hover:text-rose-500 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* AI Diet Planner Tab */}
      {activeSubTab === 'planner' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 border border-cream-200 dark:border-darkbg-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                Personalized Nutritional Meal Plans
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Generated from your actual age, height, weight, activity levels, allergies, and calorie goals.
              </p>
            </div>
            <button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{generating ? 'Formulating Plan...' : 'Generate New Plan'}</span>
            </button>
          </div>

          {dietPlans.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-darkbg-800 rounded-3xl border border-cream-200 dark:border-darkbg-700">
              <Sparkles className="w-10 h-10 text-brand-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                No personalized plan formulated yet
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Click "Generate New Plan" to automatically calculate your optimal BMR/TDEE deficit and craft Indian breakfast, lunch, snack, and dinner menus.
              </p>
              <button
                onClick={handleGeneratePlan}
                disabled={generating}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
              >
                Generate Personalized Plan
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {dietPlans.map((plan) => {
                const pData = plan.planData || {};
                const meals = pData.meals || {};
                const energy = pData.energyRequirements || {};

                return (
                  <div
                    key={plan.id}
                    className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 sm:p-8 border border-cream-200 dark:border-darkbg-700 shadow-sm space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cream-200 dark:border-darkbg-700 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                            {plan.title}
                          </h4>
                          <Badge variant="brand">{plan.goal.replace(/_/g, ' ')}</Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Daily Energy Target: <strong className="text-slate-700 dark:text-slate-200">{plan.dailyCalorieTarget} kcal</strong> (BMR: {energy.bmrKcal} kcal, TDEE: {energy.tdeeKcal} kcal)
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">Created: {plan.createdAt.split('T')[0]}</span>
                    </div>

                    {/* Meal cards in the plan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Breakfast */}
                      <div className="p-4 rounded-2xl bg-cream-50 dark:bg-darkbg-900 border border-cream-200 dark:border-darkbg-700">
                        <h5 className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span>🌅</span> Breakfast Recommendation
                        </h5>
                        {(meals.breakfast || []).map((item: any, i: number) => (
                          <div key={i} className="mb-2 last:mb-0 text-xs">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                            <p className="text-slate-500 text-[11px] mt-0.5">{item.prep}</p>
                            <div className="text-[10px] text-brand-600 font-mono mt-1">
                              {item.calories} kcal • {item.protein}g Protein
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Lunch */}
                      <div className="p-4 rounded-2xl bg-cream-50 dark:bg-darkbg-900 border border-cream-200 dark:border-darkbg-700">
                        <h5 className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span>☀️</span> Lunch Recommendation
                        </h5>
                        {(meals.lunch || []).map((item: any, i: number) => (
                          <div key={i} className="mb-2 last:mb-0 text-xs">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                            <p className="text-slate-500 text-[11px] mt-0.5">{item.prep}</p>
                            <div className="text-[10px] text-amber-600 font-mono mt-1">
                              {item.calories} kcal • {item.protein}g Protein
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Snacks */}
                      <div className="p-4 rounded-2xl bg-cream-50 dark:bg-darkbg-900 border border-cream-200 dark:border-darkbg-700">
                        <h5 className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span>🍎</span> Snacks & Hydration
                        </h5>
                        {[...(meals.morningSnack || []), ...(meals.eveningSnack || [])].map((item: any, i: number) => (
                          <div key={i} className="mb-2 last:mb-0 text-xs">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                            <p className="text-slate-500 text-[11px] mt-0.5">{item.prep}</p>
                            <div className="text-[10px] text-emerald-600 font-mono mt-1">
                              {item.calories} kcal • {item.protein}g Protein
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Dinner */}
                      <div className="p-4 rounded-2xl bg-cream-50 dark:bg-darkbg-900 border border-cream-200 dark:border-darkbg-700">
                        <h5 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span>🌙</span> Dinner Recommendation
                        </h5>
                        {(meals.dinner || []).map((item: any, i: number) => (
                          <div key={i} className="mb-2 last:mb-0 text-xs">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                            <p className="text-slate-500 text-[11px] mt-0.5">{item.prep}</p>
                            <div className="text-[10px] text-indigo-600 font-mono mt-1">
                              {item.calories} kcal • {item.protein}g Protein
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/60 text-[11px] text-amber-800 dark:text-amber-300">
                      <strong>Professional Advisory:</strong> {pData.medicalDisclaimer}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Verified Indian Food Library Tab */}
      {activeSubTab === 'database' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 border border-cream-200 dark:border-darkbg-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Idli, Dosa, Ragi Mudde, Paneer, Dal..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs font-medium focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              onClick={() => setIsCustomFoodModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Food</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {foods.map((food) => (
              <div
                key={food.id}
                className="p-4 rounded-2xl bg-white dark:bg-darkbg-800 border border-cream-200 dark:border-darkbg-700 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {food.name}
                    </h5>
                    <Badge variant={food.dietaryClassification === 'veg' ? 'success' : food.dietaryClassification === 'vegan' ? 'brand' : 'neutral'}>
                      {food.dietaryClassification}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Per {food.servingSize} {food.servingUnit}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-cream-100 dark:border-darkbg-700 flex justify-between items-center text-xs">
                  <span className="font-extrabold text-amber-600">{food.calories} kcal</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    P: {food.proteinGrams}g • C: {food.carbohydrateGrams}g • F: {food.fatGrams}g
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Food Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title={`Log Food for ${selectedMealType.replace(/_/g, ' ').toUpperCase()}`}
        subtitle="Search verified database or choose custom item"
      >
        <form onSubmit={handleAddMealItem} className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to filter Indian foods..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 border border-cream-200 dark:border-darkbg-700 rounded-xl p-2 bg-cream-50/50 dark:bg-darkbg-900/50">
            {foods.slice(0, 12).map((food) => {
              const isSelected = selectedFood?.id === food.id;
              return (
                <div
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-xs transition ${
                    isSelected
                      ? 'bg-brand-600 text-white font-bold'
                      : 'hover:bg-cream-200 dark:hover:bg-darkbg-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div>
                    <span>{food.name}</span>
                    <span className={`text-[10px] ml-1.5 ${isSelected ? 'text-brand-100' : 'text-slate-400'}`}>
                      ({food.servingSize} {food.servingUnit})
                    </span>
                  </div>
                  <span className="font-mono">{food.calories} kcal</span>
                </div>
              );
            })}
          </div>

          {selectedFood && (
            <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl border border-brand-200 dark:border-brand-800 text-xs">
              <p className="font-bold text-brand-900 dark:text-brand-200">
                Selected: {selectedFood.name}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <label className="text-slate-600 dark:text-slate-400">Portion / Quantity:</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-darkbg-900 border text-center text-xs font-bold"
                />
                <span className="text-slate-500 font-medium">{selectedFood.servingUnit}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-cream-200 dark:border-darkbg-700">
            <button
              type="button"
              onClick={() => setIsLogModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFood}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
            >
              Add to Diary
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Custom Food Modal */}
      <Modal
        isOpen={isCustomFoodModalOpen}
        onClose={() => setIsCustomFoodModalOpen(false)}
        title="Add Custom Recipe / Food Item"
        subtitle="Save your own preparation to your personal food database"
      >
        <form onSubmit={handleCreateCustomFood} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Food Item Name *
            </label>
            <input
              type="text"
              required
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Grandma's Ragi Halwa"
              className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Serving Size
              </label>
              <input
                type="number"
                step="0.5"
                value={customServingSize}
                onChange={(e) => setCustomServingSize(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Serving Unit
              </label>
              <input
                type="text"
                value={customServingUnit}
                onChange={(e) => setCustomServingUnit(e.target.value)}
                placeholder="bowl / piece / grams"
                className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border border-cream-300 dark:border-darkbg-700 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Calories</label>
              <input
                type="number"
                required
                value={customCalories}
                onChange={(e) => setCustomCalories(e.target.value)}
                placeholder="kcal"
                className="w-full px-2 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Protein (g)</label>
              <input
                type="number"
                step="0.1"
                value={customProtein}
                onChange={(e) => setCustomProtein(e.target.value)}
                placeholder="g"
                className="w-full px-2 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Carbs (g)</label>
              <input
                type="number"
                step="0.1"
                value={customCarbs}
                onChange={(e) => setCustomCarbs(e.target.value)}
                placeholder="g"
                className="w-full px-2 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Fat (g)</label>
              <input
                type="number"
                step="0.1"
                value={customFat}
                onChange={(e) => setCustomFat(e.target.value)}
                placeholder="g"
                className="w-full px-2 py-1.5 rounded-xl bg-cream-50 dark:bg-darkbg-900 border text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-cream-200 dark:border-darkbg-700">
            <button
              type="button"
              onClick={() => setIsCustomFoodModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold"
            >
              Save Custom Food
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
