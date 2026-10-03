import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Clearing existing demo data...');
  // Delete in proper order to respect foreign keys
  await prisma.mealLogItem.deleteMany({});
  await prisma.mealLog.deleteMany({});
  await prisma.workoutExercise.deleteMany({});
  await prisma.workout.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.dailyActivitySummary.deleteMany({});
  await prisma.bodyMeasurement.deleteMany({});
  await prisma.heartRateRecord.deleteMany({});
  await prisma.sleepRecord.deleteMany({});
  await prisma.waterEntry.deleteMany({});
  await prisma.wellnessLog.deleteMany({});
  await prisma.dietPlan.deleteMany({});
  await prisma.userGoal.deleteMany({});
  await prisma.reminderPreference.deleteMany({});
  await prisma.healthDataSource.deleteMany({});
  await prisma.userProfile.deleteMany({});
  await prisma.food.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('[Seed] Populating verified food database...');
  const verifiedFoods = [
    {
      name: 'Idli',
      servingSize: 2,
      servingUnit: 'pieces (100g)',
      calories: 130,
      proteinGrams: 4.5,
      carbohydrateGrams: 26.0,
      fatGrams: 0.8,
      fiberGrams: 2.0,
      category: 'grain',
      dietaryClassification: 'veg',
    },
    {
      name: 'Plain Dosa',
      servingSize: 1,
      servingUnit: 'piece (100g)',
      calories: 165,
      proteinGrams: 3.8,
      carbohydrateGrams: 28.0,
      fatGrams: 4.0,
      fiberGrams: 1.5,
      category: 'grain',
      dietaryClassification: 'veg',
    },
    {
      name: 'Masala Dosa',
      servingSize: 1,
      servingUnit: 'piece (150g)',
      calories: 280,
      proteinGrams: 5.5,
      carbohydrateGrams: 38.0,
      fatGrams: 12.0,
      fiberGrams: 3.0,
      category: 'grain',
      dietaryClassification: 'veg',
    },
    {
      name: 'Cooked White Rice',
      servingSize: 1,
      servingUnit: 'cup (150g)',
      calories: 195,
      proteinGrams: 4.0,
      carbohydrateGrams: 43.0,
      fatGrams: 0.4,
      fiberGrams: 1.0,
      category: 'grain',
      dietaryClassification: 'vegan',
    },
    {
      name: 'Cooked Brown Rice',
      servingSize: 1,
      servingUnit: 'cup (150g)',
      calories: 165,
      proteinGrams: 3.5,
      carbohydrateGrams: 35.0,
      fatGrams: 1.5,
      fiberGrams: 2.8,
      category: 'grain',
      dietaryClassification: 'vegan',
    },
    {
      name: 'Whole Wheat Chapati / Roti',
      servingSize: 1,
      servingUnit: 'piece (40g)',
      calories: 85,
      proteinGrams: 3.2,
      carbohydrateGrams: 17.0,
      fatGrams: 0.6,
      fiberGrams: 2.8,
      category: 'grain',
      dietaryClassification: 'vegan',
    },
    {
      name: 'Ragi Mudde (Finger Millet Ball)',
      servingSize: 1,
      servingUnit: 'ball (200g)',
      calories: 220,
      proteinGrams: 5.8,
      carbohydrateGrams: 48.0,
      fatGrams: 1.0,
      fiberGrams: 7.2,
      category: 'grain',
      dietaryClassification: 'vegan',
    },
    {
      name: 'Ragi Porridge / Malt',
      servingSize: 1,
      servingUnit: 'cup (250ml)',
      calories: 140,
      proteinGrams: 3.5,
      carbohydrateGrams: 28.0,
      fatGrams: 1.2,
      fiberGrams: 3.5,
      category: 'grain',
      dietaryClassification: 'veg',
    },
    {
      name: 'Yellow Dal Tadka',
      servingSize: 1,
      servingUnit: 'katori / bowl (150g)',
      calories: 150,
      proteinGrams: 8.5,
      carbohydrateGrams: 20.0,
      fatGrams: 4.0,
      fiberGrams: 4.5,
      category: 'protein',
      dietaryClassification: 'veg',
    },
    {
      name: 'South Indian Sambar',
      servingSize: 1,
      servingUnit: 'bowl (150g)',
      calories: 110,
      proteinGrams: 4.2,
      carbohydrateGrams: 18.0,
      fatGrams: 2.5,
      fiberGrams: 4.0,
      category: 'vegetable',
      dietaryClassification: 'veg',
    },
    {
      name: 'Tomato Pepper Rasam',
      servingSize: 1,
      servingUnit: 'bowl (150g)',
      calories: 55,
      proteinGrams: 1.5,
      carbohydrateGrams: 9.0,
      fatGrams: 1.5,
      fiberGrams: 1.8,
      category: 'soup',
      dietaryClassification: 'veg',
    },
    {
      name: 'Paneer Bhurji / Curry',
      servingSize: 1,
      servingUnit: 'bowl (120g)',
      calories: 265,
      proteinGrams: 18.0,
      carbohydrateGrams: 5.0,
      fatGrams: 19.0,
      fiberGrams: 1.0,
      category: 'dairy',
      dietaryClassification: 'veg',
    },
    {
      name: 'Fresh Paneer (Raw)',
      servingSize: 100,
      servingUnit: 'grams',
      calories: 290,
      proteinGrams: 18.5,
      carbohydrateGrams: 4.0,
      fatGrams: 22.0,
      fiberGrams: 0.0,
      category: 'dairy',
      dietaryClassification: 'veg',
    },
    {
      name: 'Boiled Egg (Large)',
      servingSize: 1,
      servingUnit: 'egg (50g)',
      calories: 74,
      proteinGrams: 6.3,
      carbohydrateGrams: 0.4,
      fatGrams: 5.0,
      fiberGrams: 0.0,
      category: 'protein',
      dietaryClassification: 'egg',
    },
    {
      name: 'Egg Masala Omelette',
      servingSize: 2,
      servingUnit: 'eggs (110g)',
      calories: 175,
      proteinGrams: 13.0,
      carbohydrateGrams: 2.5,
      fatGrams: 12.5,
      fiberGrams: 0.5,
      category: 'protein',
      dietaryClassification: 'egg',
    },
    {
      name: 'Homemade Curd / Dahi',
      servingSize: 1,
      servingUnit: 'katori / cup (150g)',
      calories: 95,
      proteinGrams: 5.2,
      carbohydrateGrams: 7.0,
      fatGrams: 4.8,
      fiberGrams: 0.0,
      category: 'dairy',
      dietaryClassification: 'veg',
    },
    {
      name: 'Fresh Cow Milk',
      servingSize: 1,
      servingUnit: 'glass (200ml)',
      calories: 125,
      proteinGrams: 6.4,
      carbohydrateGrams: 9.6,
      fatGrams: 6.5,
      fiberGrams: 0.0,
      category: 'dairy',
      dietaryClassification: 'veg',
    },
    {
      name: 'Grilled Chicken Breast',
      servingSize: 100,
      servingUnit: 'grams',
      calories: 165,
      proteinGrams: 31.0,
      carbohydrateGrams: 0.0,
      fatGrams: 3.6,
      fiberGrams: 0.0,
      category: 'protein',
      dietaryClassification: 'non-veg',
    },
    {
      name: 'Home-style Chicken Curry',
      servingSize: 1,
      servingUnit: 'bowl (150g)',
      calories: 240,
      proteinGrams: 22.0,
      carbohydrateGrams: 6.0,
      fatGrams: 14.0,
      fiberGrams: 1.5,
      category: 'protein',
      dietaryClassification: 'non-veg',
    },
    {
      name: 'Grilled Rohu / Sea Fish',
      servingSize: 100,
      servingUnit: 'grams',
      calories: 170,
      proteinGrams: 20.0,
      carbohydrateGrams: 3.0,
      fatGrams: 8.5,
      fiberGrams: 0.5,
      category: 'protein',
      dietaryClassification: 'non-veg',
    },
    {
      name: 'Mixed Nuts (Almonds & Walnuts)',
      servingSize: 30,
      servingUnit: 'grams',
      calories: 185,
      proteinGrams: 5.0,
      carbohydrateGrams: 6.0,
      fatGrams: 16.0,
      fiberGrams: 3.0,
      category: 'snack',
      dietaryClassification: 'vegan',
    },
    {
      name: 'Moong Sprouts Salad',
      servingSize: 1,
      servingUnit: 'cup (100g)',
      calories: 80,
      proteinGrams: 7.0,
      carbohydrateGrams: 14.0,
      fatGrams: 0.5,
      fiberGrams: 4.0,
      category: 'snack',
      dietaryClassification: 'vegan',
    },
    {
      name: 'Rolled Oats Porridge',
      servingSize: 1,
      servingUnit: 'bowl (150g)',
      calories: 140,
      proteinGrams: 5.0,
      carbohydrateGrams: 25.0,
      fatGrams: 2.5,
      fiberGrams: 4.0,
      category: 'grain',
      dietaryClassification: 'veg',
    },
    {
      name: 'Fresh Mixed Green Salad',
      servingSize: 1,
      servingUnit: 'bowl (150g)',
      calories: 35,
      proteinGrams: 1.5,
      carbohydrateGrams: 7.0,
      fatGrams: 0.3,
      fiberGrams: 2.5,
      category: 'salad',
      dietaryClassification: 'vegan',
    },
    {
      name: 'Palak Paneer',
      servingSize: 1,
      servingUnit: 'bowl (150g)',
      calories: 210,
      proteinGrams: 11.0,
      carbohydrateGrams: 8.0,
      fatGrams: 15.0,
      fiberGrams: 3.5,
      category: 'vegetable',
      dietaryClassification: 'veg',
    },
    {
      name: 'Chana Masala (Chickpeas)',
      servingSize: 1,
      servingUnit: 'bowl (150g)',
      calories: 190,
      proteinGrams: 8.5,
      carbohydrateGrams: 30.0,
      fatGrams: 4.5,
      fiberGrams: 6.5,
      category: 'protein',
      dietaryClassification: 'vegan',
    },
    {
      name: 'Mixed Seasonal Sabzi',
      servingSize: 1,
      servingUnit: 'bowl (150g)',
      calories: 115,
      proteinGrams: 3.0,
      carbohydrateGrams: 14.0,
      fatGrams: 5.5,
      fiberGrams: 4.0,
      category: 'vegetable',
      dietaryClassification: 'vegan',
    },
    {
      name: 'Fresh Apple',
      servingSize: 1,
      servingUnit: 'medium fruit (150g)',
      calories: 80,
      proteinGrams: 0.4,
      carbohydrateGrams: 21.0,
      fatGrams: 0.3,
      fiberGrams: 4.0,
      category: 'fruit',
      dietaryClassification: 'vegan',
    },
    {
      name: 'Fresh Banana',
      servingSize: 1,
      servingUnit: 'medium fruit (120g)',
      calories: 105,
      proteinGrams: 1.3,
      carbohydrateGrams: 27.0,
      fatGrams: 0.3,
      fiberGrams: 3.0,
      category: 'fruit',
      dietaryClassification: 'vegan',
    },
    {
      name: 'Papaya Slices',
      servingSize: 1,
      servingUnit: 'cup (140g)',
      calories: 60,
      proteinGrams: 0.8,
      carbohydrateGrams: 15.0,
      fatGrams: 0.4,
      fiberGrams: 2.5,
      category: 'fruit',
      dietaryClassification: 'vegan',
    }
  ];

  for (const food of verifiedFoods) {
    await prisma.food.create({ data: food });
  }

  console.log('[Seed] Creating demo user...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  const demoUser = await prisma.user.create({
    data: {
      name: 'Aarav Sharma',
      email: 'demo@nutricare.com',
      passwordHash,
      profile: {
        create: {
          dateOfBirth: new Date('1994-06-15'),
          heightCm: 175,
          gender: 'male',
          activityLevel: 'moderately_active',
          fitnessGoal: 'weight_loss',
          dietaryPreference: 'vegetarian',
          allergies: 'peanuts',
          foodDislikes: 'bitter gourd',
          preferredUnits: 'metric',
          timeZone: 'Asia/Kolkata',
        }
      }
    }
  });

  console.log('[Seed] Creating historical body measurements...');
  const now = new Date();
  const measurements = [
    { daysAgo: 28, weightKg: 78.5, waistCm: 89.0, hipCm: 101.0, neckCm: 38.0, bodyFat: 24.5, muscleMass: 55.2 },
    { daysAgo: 21, weightKg: 77.8, waistCm: 88.0, hipCm: 100.5, neckCm: 38.0, bodyFat: 24.0, muscleMass: 55.4 },
    { daysAgo: 14, weightKg: 77.0, waistCm: 87.0, hipCm: 100.0, neckCm: 37.5, bodyFat: 23.4, muscleMass: 55.6 },
    { daysAgo: 7,  weightKg: 76.2, waistCm: 86.0, hipCm: 99.0,  neckCm: 37.5, bodyFat: 22.8, muscleMass: 55.8 },
    { daysAgo: 0,  weightKg: 75.5, waistCm: 85.0, hipCm: 98.0,  neckCm: 37.0, bodyFat: 22.1, muscleMass: 56.0 },
  ];

  for (const m of measurements) {
    const recordDate = new Date(now.getTime() - m.daysAgo * 86400000);
    await prisma.bodyMeasurement.create({
      data: {
        userId: demoUser.id,
        weightKg: m.weightKg,
        waistCm: m.waistCm,
        hipCm: m.hipCm,
        neckCm: m.neckCm,
        bodyFatPercentage: m.bodyFat,
        muscleMassKg: m.muscleMass,
        recordedAt: recordDate,
        source: 'manual',
        notes: m.daysAgo === 0 ? 'Weekly check-in, consistent caloric deficit.' : 'Routine morning measurement'
      }
    });
  }

  console.log('[Seed] Creating recent activity logs & daily summaries...');
  for (let i = 6; i >= 0; i--) {
    const logDate = new Date(now.getTime() - i * 86400000);
    const dateStr = logDate.toISOString().split('T')[0];
    const steps = 8000 + Math.floor(Math.random() * 4500);
    const distanceMeters = Math.round(steps * 0.76);
    const activeMinutes = 45 + Math.floor(Math.random() * 40);
    const calories = Math.round(activeMinutes * 6.5 + steps * 0.04);

    await prisma.dailyActivitySummary.create({
      data: {
        userId: demoUser.id,
        summaryDate: dateStr,
        steps,
        distanceMeters,
        activeMinutes,
        sedentaryMinutes: 480,
        estimatedCaloriesBurned: calories,
        source: 'manual'
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: demoUser.id,
        activityType: i % 2 === 0 ? 'walking' : 'running',
        durationMinutes: 35,
        distanceMeters: i % 2 === 0 ? 3200 : 4800,
        steps: i % 2 === 0 ? 4200 : 5400,
        intensity: i % 2 === 0 ? 'moderate' : 'high',
        estimatedCaloriesBurned: i % 2 === 0 ? 180 : 320,
        recordedAt: logDate,
        source: 'manual',
        notes: i % 2 === 0 ? 'Evening brisk walk in the park' : 'Morning cardio jog'
      }
    });
  }

  console.log('[Seed] Creating sample workouts...');
  const workout1 = await prisma.workout.create({
    data: {
      userId: demoUser.id,
      workoutType: 'strength',
      title: 'Full Body Functional Strength',
      startedAt: new Date(now.getTime() - 86400000),
      durationMinutes: 50,
      notes: 'Focused on form, progressive overload on squats',
      exercises: {
        create: [
          { exerciseName: 'Barbell Squats', sets: 4, repetitions: 10, weightKg: 65 },
          { exerciseName: 'Dumbbell Bench Press', sets: 3, repetitions: 12, weightKg: 20 },
          { exerciseName: 'Bent-Over Rows', sets: 3, repetitions: 12, weightKg: 35 },
          { exerciseName: 'Plank Hold', sets: 3, durationSeconds: 60 }
        ]
      }
    }
  });

  const workout2 = await prisma.workout.create({
    data: {
      userId: demoUser.id,
      workoutType: 'yoga',
      title: 'Vinyasa Flow & Deep Mobility',
      startedAt: new Date(now.getTime() - 2 * 86400000),
      durationMinutes: 40,
      notes: 'Hip openers and hamstring stretches'
    }
  });

  console.log('[Seed] Creating heart rate records...');
  for (let i = 5; i >= 0; i--) {
    const hrDate = new Date(now.getTime() - i * 86400000);
    await prisma.heartRateRecord.create({
      data: {
        userId: demoUser.id,
        heartRateBpm: 62 + Math.floor(Math.random() * 8),
        measurementType: 'resting',
        recordedAt: hrDate,
        source: 'manual',
        notes: 'Morning resting pulse taken after waking'
      }
    });
  }

  console.log('[Seed] Creating sleep records...');
  for (let i = 6; i >= 0; i--) {
    const bed = new Date(now.getTime() - (i + 1) * 86400000);
    bed.setHours(23, 0, 0, 0);
    const wake = new Date(bed.getTime() + (7.5 * 3600000));
    await prisma.sleepRecord.create({
      data: {
        userId: demoUser.id,
        bedtime: bed,
        wakeTime: wake,
        durationMinutes: 450,
        sleepQuality: 4,
        source: 'manual',
        notes: 'Felt well rested, no wakeups during the night'
      }
    });
  }

  console.log('[Seed] Logging sample meals for today...');
  const idliFood = await prisma.food.findFirst({ where: { name: 'Idli' } });
  const sambarFood = await prisma.food.findFirst({ where: { name: 'South Indian Sambar' } });
  const chapatiFood = await prisma.food.findFirst({ where: { name: 'Whole Wheat Chapati / Roti' } });
  const dalFood = await prisma.food.findFirst({ where: { name: 'Yellow Dal Tadka' } });
  const sproutsFood = await prisma.food.findFirst({ where: { name: 'Moong Sprouts Salad' } });

  // Breakfast
  const breakfast = await prisma.mealLog.create({
    data: {
      userId: demoUser.id,
      mealType: 'breakfast',
      loggedAt: new Date(now.setHours(8, 30, 0, 0)),
      notes: 'Healthy South Indian breakfast',
      items: {
        create: [
          {
            foodId: idliFood?.id,
            foodNameSnapshot: 'Idli',
            quantity: 2,
            servingUnit: 'pieces (100g)',
            calories: 130,
            proteinGrams: 4.5,
            carbohydrateGrams: 26.0,
            fatGrams: 0.8,
            fiberGrams: 2.0
          },
          {
            foodId: sambarFood?.id,
            foodNameSnapshot: 'South Indian Sambar',
            quantity: 1,
            servingUnit: 'bowl (150g)',
            calories: 110,
            proteinGrams: 4.2,
            carbohydrateGrams: 18.0,
            fatGrams: 2.5,
            fiberGrams: 4.0
          }
        ]
      }
    }
  });

  // Lunch
  await prisma.mealLog.create({
    data: {
      userId: demoUser.id,
      mealType: 'lunch',
      loggedAt: new Date(now.setHours(13, 15, 0, 0)),
      notes: 'High fiber lunch',
      items: {
        create: [
          {
            foodId: chapatiFood?.id,
            foodNameSnapshot: 'Whole Wheat Chapati / Roti',
            quantity: 2,
            servingUnit: 'pieces (80g)',
            calories: 170,
            proteinGrams: 6.4,
            carbohydrateGrams: 34.0,
            fatGrams: 1.2,
            fiberGrams: 5.6
          },
          {
            foodId: dalFood?.id,
            foodNameSnapshot: 'Yellow Dal Tadka',
            quantity: 1,
            servingUnit: 'bowl (150g)',
            calories: 150,
            proteinGrams: 8.5,
            carbohydrateGrams: 20.0,
            fatGrams: 4.0,
            fiberGrams: 4.5
          }
        ]
      }
    }
  });

  // Snack
  await prisma.mealLog.create({
    data: {
      userId: demoUser.id,
      mealType: 'evening_snack',
      loggedAt: new Date(now.setHours(17, 30, 0, 0)),
      notes: 'Post-workout protein boost',
      items: {
        create: [
          {
            foodId: sproutsFood?.id,
            foodNameSnapshot: 'Moong Sprouts Salad',
            quantity: 1,
            servingUnit: 'cup (100g)',
            calories: 80,
            proteinGrams: 7.0,
            carbohydrateGrams: 14.0,
            fatGrams: 0.5,
            fiberGrams: 4.0
          }
        ]
      }
    }
  });

  console.log('[Seed] Creating hydration entries for today...');
  await prisma.waterEntry.create({ data: { userId: demoUser.id, amountMl: 500, recordedAt: new Date(now.setHours(8, 0, 0, 0)) } });
  await prisma.waterEntry.create({ data: { userId: demoUser.id, amountMl: 500, recordedAt: new Date(now.setHours(11, 30, 0, 0)) } });
  await prisma.waterEntry.create({ data: { userId: demoUser.id, amountMl: 750, recordedAt: new Date(now.setHours(14, 0, 0, 0)) } });
  await prisma.waterEntry.create({ data: { userId: demoUser.id, amountMl: 500, recordedAt: new Date(now.setHours(17, 0, 0, 0)) } });

  console.log('[Seed] Creating daily wellness logs...');
  for (let i = 4; i >= 0; i--) {
    const wDate = new Date(now.getTime() - i * 86400000);
    await prisma.wellnessLog.create({
      data: {
        userId: demoUser.id,
        moodScore: 8,
        energyScore: 8 - (i % 2),
        stressScore: 3,
        sorenessScore: i === 1 ? 5 : 2,
        recoveryScore: 8,
        notes: i === 0 ? 'High energy, excited about fitness streak' : 'Solid productive day',
        recordedAt: wDate
      }
    });
  }

  console.log('[Seed] Creating user goals & diet plan...');
  const userGoals = [
    { goalType: 'daily_steps', targetValue: 10000, unit: 'steps' },
    { goalType: 'water_intake', targetValue: 3000, unit: 'ml' },
    { goalType: 'sleep_duration', targetValue: 480, unit: 'minutes' },
    { goalType: 'workout_frequency', targetValue: 5, unit: 'days/week' },
    { goalType: 'daily_calories', targetValue: 2000, unit: 'kcal' },
    { goalType: 'target_weight', targetValue: 70.0, unit: 'kg' }
  ];

  for (const g of userGoals) {
    await prisma.userGoal.create({
      data: {
        userId: demoUser.id,
        goalType: g.goalType,
        targetValue: g.targetValue,
        unit: g.unit,
        isActive: true
      }
    });
  }

  const samplePlanData = {
    dailyCalorieTarget: 1950,
    macros: { proteinGrams: 110, carbsGrams: 240, fatGrams: 55 },
    meals: {
      breakfast: [
        { name: 'Idli (3 pcs) with Tomato Chutney & Vegetable Sambar', calories: 250, protein: 8, prep: 'Steam idlis fresh, temper sambar with mustard & curry leaves.' },
        { name: 'Warm Glass of Skimmed Milk', calories: 90, protein: 6, prep: 'Drink warm with pinch of turmeric.' }
      ],
      morningSnack: [
        { name: 'Fresh Seasonal Apple or Papaya Slices', calories: 80, protein: 1, prep: 'Wash and slice fresh.' }
      ],
      lunch: [
        { name: '2 Whole Wheat Rotis with Dal Tadka & Bhindi Sabzi', calories: 420, protein: 16, prep: 'Cook rotis without ghee; use light cumin tempering for dal.' },
        { name: 'Katori of Fresh Curd / Dahi', calories: 95, protein: 5, prep: 'Unsweetened probiotic curd.' }
      ],
      eveningSnack: [
        { name: 'Sprouted Moong Salad with Lemon & Cucumber', calories: 120, protein: 8, prep: 'Toss steamed sprouts with diced cucumber, tomatoes, and lemon juice.' },
        { name: 'Green Tea or Black Coffee', calories: 5, protein: 0, prep: 'Brew fresh with no added sugar.' }
      ],
      dinner: [
        { name: 'Ragi Mudde (Finger Millet Ball) with Light Vegetable Sambar', calories: 330, protein: 10, prep: 'Cook ragi flour with boiling water into a smooth dumpling.' },
        { name: 'Grilled Paneer Cubes (100g) with Black Pepper', calories: 260, protein: 18, prep: 'Pan-sear paneer cubes with 1 tsp olive oil and pepper.' }
      ]
    },
    alternatives: [
      { original: 'Idli', alternative: 'Ragi Dosa or Rolled Oats with milk' },
      { original: 'Paneer', alternative: 'Tofu or Boiled Eggs / Grilled Chicken Breast' }
    ],
    guidelines: [
      'Drink 500ml water 30 minutes before each main meal.',
      'Maintain an eating window between 8:30 AM and 8:30 PM.',
      'Consult a registered dietitian or doctor before making drastic dietary changes if you have medical conditions.'
    ]
  };

  await prisma.dietPlan.create({
    data: {
      userId: demoUser.id,
      title: 'Personalized Weight Management & Vitality Plan',
      goal: 'weight_loss',
      dailyCalorieTarget: 1950,
      planData: JSON.stringify(samplePlanData)
    }
  });

  console.log('[Seed] Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('[Seed] Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
