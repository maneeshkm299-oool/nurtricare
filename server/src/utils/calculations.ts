export interface BMIData {
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  healthyWeightRangeKg: { min: number; max: number };
  disclaimer: string;
}

export function calculateBMI(weightKg: number, heightCm: number): BMIData {
  if (weightKg <= 0 || heightCm <= 0) {
    return {
      bmi: 0,
      category: 'Normal',
      healthyWeightRangeKg: { min: 0, max: 0 },
      disclaimer: 'Height and weight must be positive numbers.'
    };
  }

  const heightMeters = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightMeters * heightMeters)).toFixed(1));

  let category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese' = 'Normal';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25.0) category = 'Normal';
  else if (bmi < 30.0) category = 'Overweight';
  else category = 'Obese';

  const minHealthy = parseFloat((18.5 * heightMeters * heightMeters).toFixed(1));
  const maxHealthy = parseFloat((24.9 * heightMeters * heightMeters).toFixed(1));

  return {
    bmi,
    category,
    healthyWeightRangeKg: { min: minHealthy, max: maxHealthy },
    disclaimer: 'BMI is a general screening indicator and does not directly measure body fat percentage, bone density, or muscular composition.'
  };
}

export function calculateAge(dateOfBirth: Date | string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return Math.max(16, age);
}

export function calculateBMR(weightKg: number, heightCm: number, age: number, gender?: string | null): number {
  // Mifflin-St Jeor Equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender?.toLowerCase() === 'male') {
    return Math.round(base + 5);
  } else if (gender?.toLowerCase() === 'female') {
    return Math.round(base - 161);
  }
  return Math.round(base - 78);
}

export function calculateTDEE(bmr: number, activityLevel?: string | null): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9
  };
  const multiplier = (activityLevel && multipliers[activityLevel]) || 1.4;
  return Math.round(bmr * multiplier);
}

export function calculateTargetCalories(tdee: number, fitnessGoal?: string | null): number {
  let target = tdee;
  switch (fitnessGoal) {
    case 'weight_loss':
      target = tdee - 450;
      break;
    case 'weight_gain':
      target = tdee + 400;
      break;
    case 'muscle_building':
      target = tdee + 250;
      break;
    case 'weight_maintenance':
    case 'maintain_general_wellness':
    default:
      target = tdee;
      break;
  }
  // Enforce healthy floors
  return Math.max(1300, Math.round(target));
}

export function calculateMacroSplit(targetCalories: number, fitnessGoal?: string | null) {
  let proteinRatio = 0.25;
  let carbRatio = 0.50;
  let fatRatio = 0.25;

  if (fitnessGoal === 'muscle_building') {
    proteinRatio = 0.30;
    carbRatio = 0.45;
    fatRatio = 0.25;
  } else if (fitnessGoal === 'weight_loss') {
    proteinRatio = 0.30;
    carbRatio = 0.40;
    fatRatio = 0.30;
  }

  return {
    proteinGrams: Math.round((targetCalories * proteinRatio) / 4),
    carbohydrateGrams: Math.round((targetCalories * carbRatio) / 4),
    fatGrams: Math.round((targetCalories * fatRatio) / 9)
  };
}

export function estimateActivityCalories(activityType: string, durationMinutes: number, weightKg: number = 70): number {
  // MET values for standard activities
  const mets: Record<string, number> = {
    walking: 3.5,
    running: 8.5,
    cycling: 6.8,
    swimming: 7.0,
    hiking: 6.0,
    dancing: 5.0,
    yoga: 2.8,
    stretching: 2.3,
    sports: 7.0,
    gym: 5.5,
    home_workout: 5.0,
    custom: 4.5
  };

  const met = mets[activityType.toLowerCase()] || 4.5;
  // Calories = MET * weight in kg * duration in hours
  const hours = durationMinutes / 60;
  return Math.round(met * weightKg * hours);
}
