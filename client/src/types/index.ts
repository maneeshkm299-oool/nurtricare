export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  profile?: UserProfile | null;
}

export interface UserProfile {
  id: string;
  userId: string;
  dateOfBirth?: string | null;
  heightCm?: number | null;
  gender?: string | null;
  activityLevel?: string | null;
  fitnessGoal?: string | null;
  dietaryPreference?: string | null;
  allergies?: string | null;
  foodDislikes?: string | null;
  preferredUnits?: string | null;
  timeZone?: string | null;
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  weightKg?: number | null;
  waistCm?: number | null;
  hipCm?: number | null;
  neckCm?: number | null;
  bodyFatPercentage?: number | null;
  muscleMassKg?: number | null;
  recordedAt: string;
  source: string;
  notes?: string | null;
}

export interface BMIData {
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  healthyWeightRangeKg: { min: number; max: number };
  disclaimer: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  activityType: string;
  durationMinutes: number;
  distanceMeters?: number | null;
  steps?: number | null;
  intensity?: string | null;
  estimatedCaloriesBurned?: number | null;
  recordedAt: string;
  source: string;
  notes?: string | null;
}

export interface DailyActivitySummary {
  id: string;
  userId: string;
  summaryDate: string;
  steps: number;
  distanceMeters: number;
  activeMinutes: number;
  sedentaryMinutes?: number | null;
  estimatedCaloriesBurned: number;
  source: string;
}

export interface WorkoutExercise {
  id?: string;
  exerciseName: string;
  sets: number;
  repetitions?: number | null;
  weightKg?: number | null;
  distanceMeters?: number | null;
  durationSeconds?: number | null;
  notes?: string | null;
}

export interface Workout {
  id: string;
  userId: string;
  workoutType: string;
  title: string;
  startedAt: string;
  endedAt?: string | null;
  durationMinutes: number;
  notes?: string | null;
  exercises: WorkoutExercise[];
}

export interface HeartRateRecord {
  id: string;
  userId: string;
  heartRateBpm: number;
  measurementType: 'resting' | 'exercise' | 'recovery' | 'general';
  recordedAt: string;
  source: string;
  notes?: string | null;
}

export interface SleepRecord {
  id: string;
  userId: string;
  bedtime: string;
  wakeTime: string;
  durationMinutes: number;
  sleepQuality?: number | null;
  source: string;
  notes?: string | null;
}

export interface Food {
  id: string;
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  fiberGrams: number;
  category: string;
  dietaryClassification: string;
  isCustom?: boolean;
}

export interface MealLogItem {
  id?: string;
  foodId?: string | null;
  foodNameSnapshot: string;
  quantity: number;
  servingUnit: string;
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  fiberGrams: number;
}

export interface MealLog {
  id: string;
  userId: string;
  mealType: 'breakfast' | 'morning_snack' | 'lunch' | 'evening_snack' | 'dinner';
  loggedAt: string;
  notes?: string | null;
  items: MealLogItem[];
}

export interface DietPlan {
  id: string;
  userId: string;
  title: string;
  goal: string;
  dailyCalorieTarget: number;
  planData: any;
  createdAt: string;
}

export interface WaterEntry {
  id: string;
  userId: string;
  amountMl: number;
  recordedAt: string;
}

export interface WellnessLog {
  id: string;
  userId: string;
  moodScore?: number | null;
  energyScore?: number | null;
  stressScore?: number | null;
  sorenessScore?: number | null;
  recoveryScore?: number | null;
  notes?: string | null;
  recordedAt: string;
}

export interface UserGoal {
  id: string;
  userId: string;
  goalType: string;
  targetValue: number;
  unit: string;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
}

export interface DashboardSummaryData {
  date: string;
  user: {
    name: string;
    email: string;
    fitnessGoal: string;
    activityLevel: string;
  };
  bodyMetrics: {
    currentWeightKg: number | null;
    previousWeightKg: number | null;
    weightTrendKg: number;
    targetWeightKg: number | null;
    bmi: BMIData | null;
    waistCm: number | null;
    hipCm: number | null;
    bodyFatPercentage: number | null;
    muscleMassKg: number | null;
    source: string;
  };
  activity: {
    steps: number;
    stepGoal: number;
    distanceMeters: number;
    activeMinutes: number;
    sedentaryMinutes: number;
    caloriesBurned: number;
    workoutsCompleted: number;
    source: string;
  };
  nutrition: {
    caloriesConsumed: number;
    calorieTarget: number;
    remainingCalories: number;
    proteinGrams: number;
    proteinTarget: number;
    carbohydrateGrams: number;
    carbohydrateTarget: number;
    fatGrams: number;
    fatTarget: number;
    fiberGrams: number;
    fiberTarget: number;
    waterMl: number;
    waterGoalMl: number;
    mealCount: number;
  };
  recovery: {
    latestSleep: {
      durationHours: number;
      durationMinutes: number;
      sleepQuality: number | null;
      bedtime: string;
      wakeTime: string;
      source: string;
    } | null;
    restingHeartRate: {
      bpm: number;
      measurementType: string;
      recordedAt: string;
      source: string;
    } | null;
    wellness: {
      energyScore: number | null;
      moodScore: number | null;
      stressScore: number | null;
      sorenessScore: number | null;
      recoveryScore: number | null;
      notes: string | null;
    } | null;
  };
  charts: {
    weeklyActivity: DailyActivitySummary[];
  };
}
