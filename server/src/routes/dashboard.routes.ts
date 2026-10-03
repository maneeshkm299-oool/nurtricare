import { Router, Response } from 'express';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { calculateBMI, calculateAge, calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacroSplit } from '../utils/calculations.js';

const router = Router();

// GET /api/dashboard/summary
router.get('/summary', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const todayStr = new Date().toISOString().split('T')[0];
    const startOfToday = new Date(`${todayStr}T00:00:00.000Z`);
    const endOfToday = new Date(`${todayStr}T23:59:59.999Z`);

    // 1. User profile
    const profile = await prisma.userProfile.findUnique({ where: { userId } });

    // 2. Body measurements
    const measurements = await prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
      take: 2
    });
    const latestMeasurement = measurements[0] || null;
    const previousMeasurement = measurements[1] || null;

    let bmiData = null;
    if (latestMeasurement?.weightKg && profile?.heightCm) {
      bmiData = calculateBMI(latestMeasurement.weightKg, profile.heightCm);
    }

    let weightTrendKg = 0;
    if (latestMeasurement?.weightKg && previousMeasurement?.weightKg) {
      weightTrendKg = parseFloat((latestMeasurement.weightKg - previousMeasurement.weightKg).toFixed(1));
    }

    // 3. User Goals
    const goals = await prisma.userGoal.findMany({ where: { userId, isActive: true } });
    const targetWeightGoal = goals.find(g => g.goalType === 'target_weight');
    const stepGoal = goals.find(g => g.goalType === 'daily_steps');
    const waterGoal = goals.find(g => g.goalType === 'water_intake');

    // 4. Daily Activity Summary
    const activitySummary = await prisma.dailyActivitySummary.findUnique({
      where: {
        userId_summaryDate: {
          userId,
          summaryDate: todayStr
        }
      }
    });

    const todaysWorkouts = await prisma.workout.findMany({
      where: {
        userId,
        startedAt: { gte: startOfToday, lte: endOfToday }
      }
    });

    // 5. Today's Nutrition & Water
    const mealsToday = await prisma.mealLog.findMany({
      where: {
        userId,
        loggedAt: { gte: startOfToday, lte: endOfToday }
      },
      include: { items: true }
    });

    let consumedCalories = 0;
    let consumedProtein = 0;
    let consumedCarbs = 0;
    let consumedFat = 0;
    let consumedFiber = 0;

    for (const m of mealsToday) {
      for (const item of m.items) {
        consumedCalories += item.calories;
        consumedProtein += item.proteinGrams;
        consumedCarbs += item.carbohydrateGrams;
        consumedFat += item.fatGrams;
        consumedFiber += item.fiberGrams;
      }
    }

    // Caloric and macro targets based on profile
    const currentWeight = latestMeasurement?.weightKg || 70;
    const currentHeight = profile?.heightCm || 170;
    const age = profile?.dateOfBirth ? calculateAge(profile.dateOfBirth) : 28;
    const bmr = calculateBMR(currentWeight, currentHeight, age, profile?.gender);
    const tdee = calculateTDEE(bmr, profile?.activityLevel);
    const targetDailyCalories = calculateTargetCalories(tdee, profile?.fitnessGoal);
    const macroTargets = calculateMacroSplit(targetDailyCalories, profile?.fitnessGoal);

    // Water intake
    const waterEntries = await prisma.waterEntry.findMany({
      where: {
        userId,
        recordedAt: { gte: startOfToday, lte: endOfToday }
      }
    });
    const consumedWaterMl = waterEntries.reduce((sum, w) => sum + w.amountMl, 0);

    // 6. Sleep & Heart Rate
    const latestSleep = await prisma.sleepRecord.findFirst({
      where: { userId },
      orderBy: { bedtime: 'desc' }
    });

    const latestHeartRate = await prisma.heartRateRecord.findFirst({
      where: { userId },
      orderBy: { recordedAt: 'desc' }
    });

    // 7. Today's Wellness Log
    const todayWellness = await prisma.wellnessLog.findFirst({
      where: {
        userId,
        recordedAt: { gte: startOfToday, lte: endOfToday }
      }
    });

    // 8. Weekly step history for miniature dashboard chart
    const weeklySummaries = await prisma.dailyActivitySummary.findMany({
      where: { userId },
      orderBy: { summaryDate: 'desc' },
      take: 7
    });

    res.json({
      date: todayStr,
      user: {
        name: req.user!.name,
        email: req.user!.email,
        fitnessGoal: profile?.fitnessGoal || 'weight_loss',
        activityLevel: profile?.activityLevel || 'moderately_active'
      },
      bodyMetrics: {
        currentWeightKg: latestMeasurement?.weightKg || null,
        previousWeightKg: previousMeasurement?.weightKg || null,
        weightTrendKg,
        targetWeightKg: targetWeightGoal?.targetValue || null,
        bmi: bmiData,
        waistCm: latestMeasurement?.waistCm || null,
        hipCm: latestMeasurement?.hipCm || null,
        bodyFatPercentage: latestMeasurement?.bodyFatPercentage || null,
        muscleMassKg: latestMeasurement?.muscleMassKg || null,
        source: latestMeasurement?.source || 'manual'
      },
      activity: {
        steps: activitySummary?.steps || 0,
        stepGoal: stepGoal?.targetValue || 10000,
        distanceMeters: activitySummary?.distanceMeters || 0,
        activeMinutes: activitySummary?.activeMinutes || 0,
        sedentaryMinutes: activitySummary?.sedentaryMinutes || 480,
        caloriesBurned: activitySummary?.estimatedCaloriesBurned || 0,
        workoutsCompleted: todaysWorkouts.length,
        source: activitySummary?.source || 'manual'
      },
      nutrition: {
        caloriesConsumed: Math.round(consumedCalories),
        calorieTarget: targetDailyCalories,
        remainingCalories: Math.max(0, targetDailyCalories - Math.round(consumedCalories)),
        proteinGrams: parseFloat(consumedProtein.toFixed(1)),
        proteinTarget: macroTargets.proteinGrams,
        carbohydrateGrams: parseFloat(consumedCarbs.toFixed(1)),
        carbohydrateTarget: macroTargets.carbohydrateGrams,
        fatGrams: parseFloat(consumedFat.toFixed(1)),
        fatTarget: macroTargets.fatGrams,
        fiberGrams: parseFloat(consumedFiber.toFixed(1)),
        fiberTarget: 30,
        waterMl: consumedWaterMl,
        waterGoalMl: waterGoal?.targetValue || 2500,
        mealCount: mealsToday.length
      },
      recovery: {
        latestSleep: latestSleep ? {
          durationHours: parseFloat((latestSleep.durationMinutes / 60).toFixed(1)),
          durationMinutes: latestSleep.durationMinutes,
          sleepQuality: latestSleep.sleepQuality,
          bedtime: latestSleep.bedtime,
          wakeTime: latestSleep.wakeTime,
          source: latestSleep.source
        } : null,
        restingHeartRate: latestHeartRate ? {
          bpm: latestHeartRate.heartRateBpm,
          measurementType: latestHeartRate.measurementType,
          recordedAt: latestHeartRate.recordedAt,
          source: latestHeartRate.source
        } : null,
        wellness: todayWellness ? {
          energyScore: todayWellness.energyScore,
          moodScore: todayWellness.moodScore,
          stressScore: todayWellness.stressScore,
          sorenessScore: todayWellness.sorenessScore,
          recoveryScore: todayWellness.recoveryScore,
          notes: todayWellness.notes
        } : null
      },
      charts: {
        weeklyActivity: weeklySummaries.reverse()
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard summary' });
  }
});

export default router;
