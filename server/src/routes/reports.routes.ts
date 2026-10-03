import { Router, Response } from 'express';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Helper to compile date range report
async function generateReportData(userId: string, days: number) {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 86400000);

  // Daily activity summaries
  const summaries = await prisma.dailyActivitySummary.findMany({
    where: {
      userId,
      createdAt: { gte: startDate }
    },
    orderBy: { summaryDate: 'asc' }
  });

  // Body measurements
  const measurements = await prisma.bodyMeasurement.findMany({
    where: {
      userId,
      recordedAt: { gte: startDate }
    },
    orderBy: { recordedAt: 'asc' }
  });

  // Sleep records
  const sleepRecords = await prisma.sleepRecord.findMany({
    where: {
      userId,
      bedtime: { gte: startDate }
    },
    orderBy: { bedtime: 'asc' }
  });

  // Heart rate records
  const heartRateRecords = await prisma.heartRateRecord.findMany({
    where: {
      userId,
      recordedAt: { gte: startDate }
    },
    orderBy: { recordedAt: 'asc' }
  });

  // Water entries
  const waterEntries = await prisma.waterEntry.findMany({
    where: {
      userId,
      recordedAt: { gte: startDate }
    },
    orderBy: { recordedAt: 'asc' }
  });

  // Meals
  const meals = await prisma.mealLog.findMany({
    where: {
      userId,
      loggedAt: { gte: startDate }
    },
    include: { items: true },
    orderBy: { loggedAt: 'asc' }
  });

  // Aggregate stats
  const totalSteps = summaries.reduce((acc, s) => acc + s.steps, 0);
  const totalCaloriesBurned = summaries.reduce((acc, s) => acc + s.estimatedCaloriesBurned, 0);
  const totalActiveMinutes = summaries.reduce((acc, s) => acc + s.activeMinutes, 0);
  const totalWaterMl = waterEntries.reduce((acc, w) => acc + w.amountMl, 0);

  let totalCaloriesConsumed = 0;
  for (const m of meals) {
    for (const item of m.items) {
      totalCaloriesConsumed += item.calories;
    }
  }

  const avgSleepHours = sleepRecords.length > 0
    ? parseFloat((sleepRecords.reduce((acc, s) => acc + s.durationMinutes, 0) / (sleepRecords.length * 60)).toFixed(1))
    : 0;

  const restingHr = heartRateRecords.filter(h => h.measurementType === 'resting');
  const avgRestingHr = restingHr.length > 0
    ? Math.round(restingHr.reduce((acc, h) => acc + h.heartRateBpm, 0) / restingHr.length)
    : null;

  return {
    periodDays: days,
    startDate: startDate.toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0],
    totals: {
      steps: totalSteps,
      caloriesBurned: Math.round(totalCaloriesBurned),
      activeMinutes: totalActiveMinutes,
      waterMl: totalWaterMl,
      caloriesConsumed: Math.round(totalCaloriesConsumed)
    },
    averages: {
      dailySteps: Math.round(totalSteps / Math.max(1, summaries.length || days)),
      dailyActiveMinutes: Math.round(totalActiveMinutes / Math.max(1, summaries.length || days)),
      sleepHours: avgSleepHours,
      restingHeartRateBpm: avgRestingHr
    },
    activityTrend: summaries,
    weightTrend: measurements.map(m => ({
      date: m.recordedAt.toISOString().split('T')[0],
      weightKg: m.weightKg,
      waistCm: m.waistCm,
      bodyFatPercentage: m.bodyFatPercentage
    })),
    sleepTrend: sleepRecords.map(s => ({
      date: s.bedtime.toISOString().split('T')[0],
      hours: parseFloat((s.durationMinutes / 60).toFixed(1)),
      quality: s.sleepQuality
    }))
  };
}

// GET /api/reports/weekly
router.get('/weekly', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const report = await generateReportData(req.user!.id, 7);
    res.json({ report });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate weekly report' });
  }
});

// GET /api/reports/monthly
router.get('/monthly', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const report = await generateReportData(req.user!.id, 30);
    res.json({ report });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate monthly report' });
  }
});

// GET /api/reports/export (Exports comprehensive CSV)
router.get('/export', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const format = (req.query.format as string) || 'csv';

    // Retrieve historical records
    const measurements = await prisma.bodyMeasurement.findMany({ where: { userId }, orderBy: { recordedAt: 'desc' } });
    const activities = await prisma.activityLog.findMany({ where: { userId }, orderBy: { recordedAt: 'desc' } });
    const meals = await prisma.mealLog.findMany({ where: { userId }, include: { items: true }, orderBy: { loggedAt: 'desc' } });
    const sleep = await prisma.sleepRecord.findMany({ where: { userId }, orderBy: { bedtime: 'desc' } });
    const water = await prisma.waterEntry.findMany({ where: { userId }, orderBy: { recordedAt: 'desc' } });

    // Generate CSV string
    let csv = 'NUTRICARE HEALTH & WELLNESS EXPORT\n';
    csv += `Export Generated At,${new Date().toISOString()}\n`;
    csv += `User ID,${userId}\n\n`;

    csv += '--- BODY MEASUREMENTS ---\n';
    csv += 'Date,Weight (kg),Waist (cm),Hip (cm),Neck (cm),Body Fat (%),Muscle Mass (kg),Source,Notes\n';
    for (const m of measurements) {
      csv += `${m.recordedAt.toISOString()},${m.weightKg || ''},${m.waistCm || ''},${m.hipCm || ''},${m.neckCm || ''},${m.bodyFatPercentage || ''},${m.muscleMassKg || ''},${m.source},"${m.notes || ''}"\n`;
    }
    csv += '\n';

    csv += '--- PHYSICAL ACTIVITIES ---\n';
    csv += 'Date,Activity Type,Duration (mins),Distance (m),Steps,Intensity,Estimated Calories Burned,Source,Notes\n';
    for (const a of activities) {
      csv += `${a.recordedAt.toISOString()},${a.activityType},${a.durationMinutes},${a.distanceMeters || ''},${a.steps || ''},${a.intensity || ''},${a.estimatedCaloriesBurned || ''},${a.source},"${a.notes || ''}"\n`;
    }
    csv += '\n';

    csv += '--- NUTRITION & MEAL LOGS ---\n';
    csv += 'Date,Meal Type,Item Name,Quantity,Unit,Calories,Protein (g),Carbohydrates (g),Fat (g),Fiber (g)\n';
    for (const m of meals) {
      for (const item of m.items) {
        csv += `${m.loggedAt.toISOString()},${m.mealType},"${item.foodNameSnapshot}",${item.quantity},${item.servingUnit},${item.calories},${item.proteinGrams},${item.carbohydrateGrams},${item.fatGrams},${item.fiberGrams}\n`;
      }
    }
    csv += '\n';

    csv += '--- SLEEP RECORDS ---\n';
    csv += 'Bedtime,Wake Time,Duration (mins),Quality (1-5),Source,Notes\n';
    for (const s of sleep) {
      csv += `${s.bedtime.toISOString()},${s.wakeTime.toISOString()},${s.durationMinutes},${s.sleepQuality || ''},${s.source},"${s.notes || ''}"\n`;
    }
    csv += '\n';

    csv += '--- HYDRATION LOGS ---\n';
    csv += 'Date,Amount (ml)\n';
    for (const w of water) {
      csv += `${w.recordedAt.toISOString()},${w.amountMl}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=nutricare-health-report-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate CSV export' });
  }
});

export default router;
