import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { estimateActivityCalories } from '../utils/calculations.js';

const router = Router();

const activitySchema = z.object({
  activityType: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  distanceMeters: z.number().nonnegative().optional().nullable(),
  steps: z.number().int().nonnegative().optional().nullable(),
  intensity: z.string().optional().nullable(),
  estimatedCaloriesBurned: z.number().nonnegative().optional().nullable(),
  recordedAt: z.string().optional(),
  source: z.string().default('manual'),
  notes: z.string().optional().nullable(),
});

// Helper to update daily summary when activity changes
async function syncDailySummary(userId: string, dateStr: string) {
  // Find all activities recorded on that date
  const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

  const dayActivities = await prisma.activityLog.findMany({
    where: {
      userId,
      recordedAt: { gte: startOfDay, lte: endOfDay }
    }
  });

  const totalSteps = dayActivities.reduce((sum, a) => sum + (a.steps || 0), 0);
  const totalDistance = dayActivities.reduce((sum, a) => sum + (a.distanceMeters || 0), 0);
  const totalActiveMinutes = dayActivities.reduce((sum, a) => sum + (a.durationMinutes || 0), 0);
  const totalCalories = dayActivities.reduce((sum, a) => sum + (a.estimatedCaloriesBurned || 0), 0);

  await prisma.dailyActivitySummary.upsert({
    where: {
      userId_summaryDate: {
        userId,
        summaryDate: dateStr
      }
    },
    update: {
      steps: totalSteps,
      distanceMeters: totalDistance,
      activeMinutes: totalActiveMinutes,
      estimatedCaloriesBurned: totalCalories,
      source: 'manual'
    },
    create: {
      userId,
      summaryDate: dateStr,
      steps: totalSteps,
      distanceMeters: totalDistance,
      activeMinutes: totalActiveMinutes,
      sedentaryMinutes: Math.max(0, 720 - totalActiveMinutes),
      estimatedCaloriesBurned: totalCalories,
      source: 'manual'
    }
  });
}

// GET /api/activities
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;

    const activities = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
      take: limit
    });

    res.json({ activities });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve activities' });
  }
});

// POST /api/activities
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = activitySchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const userId = req.user!.id;
    const { activityType, durationMinutes, distanceMeters, steps, intensity, recordedAt, source, notes } = parse.data;

    let calories = parse.data.estimatedCaloriesBurned;
    if (!calories) {
      // Fetch user's latest weight for accurate MET calorie calculation
      const latestMeasurement = await prisma.bodyMeasurement.findFirst({
        where: { userId },
        orderBy: { recordedAt: 'desc' }
      });
      const weight = latestMeasurement?.weightKg || 70;
      calories = estimateActivityCalories(activityType, durationMinutes, weight);
    }

    const logDate = recordedAt ? new Date(recordedAt) : new Date();
    const dateStr = logDate.toISOString().split('T')[0];

    const newActivity = await prisma.activityLog.create({
      data: {
        userId,
        activityType,
        durationMinutes,
        distanceMeters: distanceMeters || null,
        steps: steps || null,
        intensity: intensity || 'moderate',
        estimatedCaloriesBurned: calories,
        recordedAt: logDate,
        source: source || 'manual',
        notes: notes || null
      }
    });

    await syncDailySummary(userId, dateStr);

    res.status(201).json({
      message: 'Activity logged successfully',
      activity: newActivity
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

// PUT /api/activities/:id
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const parse = activitySchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const existing = await prisma.activityLog.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    const logDate = parse.data.recordedAt ? new Date(parse.data.recordedAt) : existing.recordedAt;
    const updated = await prisma.activityLog.update({
      where: { id },
      data: {
        ...parse.data,
        recordedAt: logDate
      }
    });

    const dateStr = logDate.toISOString().split('T')[0];
    await syncDailySummary(userId, dateStr);

    res.json({ message: 'Activity updated successfully', activity: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// DELETE /api/activities/:id
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const existing = await prisma.activityLog.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    const dateStr = existing.recordedAt.toISOString().split('T')[0];
    await prisma.activityLog.delete({ where: { id } });
    await syncDailySummary(userId, dateStr);

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

// GET /api/activities/daily-summary
router.get('/daily-summary', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const summary = await prisma.dailyActivitySummary.findUnique({
      where: {
        userId_summaryDate: {
          userId,
          summaryDate: dateStr
        }
      }
    });

    const stepGoal = await prisma.userGoal.findFirst({
      where: { userId, goalType: 'daily_steps', isActive: true }
    });

    res.json({
      summary: summary || {
        summaryDate: dateStr,
        steps: 0,
        distanceMeters: 0,
        activeMinutes: 0,
        estimatedCaloriesBurned: 0
      },
      goalSteps: stepGoal?.targetValue || 10000
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily summary' });
  }
});

// GET /api/activities/history
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const days = parseInt(req.query.days as string) || 7;

    const summaries = await prisma.dailyActivitySummary.findMany({
      where: { userId },
      orderBy: { summaryDate: 'desc' },
      take: days
    });

    res.json({ history: summaries.reverse() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve activity history' });
  }
});

export default router;
