import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const goalSchema = z.object({
  goalType: z.string().min(1),
  targetValue: z.number().positive(),
  unit: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

// GET /api/goals
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const goals = await prisma.userGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Compute achievements and streaks dynamically
    const activityCount = await prisma.activityLog.count({ where: { userId } });
    const workoutCount = await prisma.workout.count({ where: { userId } });
    const mealCount = await prisma.mealLog.count({ where: { userId } });
    const waterEntryCount = await prisma.waterEntry.count({ where: { userId } });

    // Calculate current activity streak (consecutive days with logged activity)
    const recentSummaries = await prisma.dailyActivitySummary.findMany({
      where: { userId },
      orderBy: { summaryDate: 'desc' },
      take: 30
    });

    let currentStreakDays = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today.getTime() - i * 86400000).toISOString().split('T')[0];
      const match = recentSummaries.find(s => s.summaryDate === d && s.activeMinutes > 0);
      if (match) {
        currentStreakDays++;
      } else if (i === 0) {
        // Today might still be in progress
        continue;
      } else {
        break;
      }
    }

    const achievements = [
      {
        id: 'first_step',
        title: 'Journey Begun',
        description: 'Completed your first recorded physical activity',
        unlocked: activityCount >= 1,
        icon: 'Footprints'
      },
      {
        id: 'streak_3',
        title: 'Consistency Starter',
        description: 'Maintained a 3-day active movement streak',
        unlocked: currentStreakDays >= 3,
        icon: 'Flame'
      },
      {
        id: 'streak_7',
        title: 'Weekly Warrior',
        description: 'Maintained a 7-day movement streak',
        unlocked: currentStreakDays >= 7,
        icon: 'Zap'
      },
      {
        id: 'hydration_hero',
        title: 'Hydration Hero',
        description: 'Logged at least 10 hydration entries',
        unlocked: waterEntryCount >= 10,
        icon: 'Droplets'
      },
      {
        id: 'iron_discipline',
        title: 'Iron Discipline',
        description: 'Completed 5 dedicated workout sessions',
        unlocked: workoutCount >= 5,
        icon: 'Dumbbell'
      },
      {
        id: 'nutrition_tracker',
        title: 'Mindful Eater',
        description: 'Logged over 15 meals with verified nutritional breakdown',
        unlocked: mealCount >= 15,
        icon: 'Utensils'
      }
    ];

    res.json({
      goals,
      currentStreakDays,
      achievements
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve goals and achievements' });
  }
});

// POST /api/goals
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = goalSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const { startDate, endDate, ...rest } = parse.data;
    const goal = await prisma.userGoal.create({
      data: {
        userId: req.user!.id,
        ...rest,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null
      }
    });

    res.status(201).json({ message: 'Goal established successfully', goal });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// PUT /api/goals/:id
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parse = goalSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const existing = await prisma.userGoal.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existing) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const { startDate, endDate, ...rest } = parse.data;
    const updated = await prisma.userGoal.update({
      where: { id },
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate ? new Date(endDate) : existing.endDate
      }
    });

    res.json({ message: 'Goal updated successfully', goal: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.userGoal.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existing) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    await prisma.userGoal.delete({ where: { id } });
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

export default router;
