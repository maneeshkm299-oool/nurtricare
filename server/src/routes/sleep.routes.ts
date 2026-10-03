import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const sleepSchema = z.object({
  bedtime: z.string(),
  wakeTime: z.string(),
  durationMinutes: z.number().int().positive().optional(),
  sleepQuality: z.number().int().min(1).max(5).optional().nullable(),
  source: z.string().default('manual'),
  notes: z.string().optional().nullable(),
});

// GET /api/sleep
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const records = await prisma.sleepRecord.findMany({
      where: { userId },
      orderBy: { bedtime: 'desc' },
      take: 60
    });

    const sleepGoal = await prisma.userGoal.findFirst({
      where: { userId, goalType: 'sleep_duration', isActive: true }
    });

    const totalDuration = records.reduce((acc, r) => acc + r.durationMinutes, 0);
    const avgDuration = records.length > 0 ? Math.round(totalDuration / records.length) : 0;

    res.json({
      records,
      latest: records[0] || null,
      averageDurationMinutes: avgDuration,
      sleepGoalMinutes: sleepGoal?.targetValue || 480,
      disclaimer: 'NutriCare provides general sleep-habit logs and insights, not medical sleep apnea or insomnia diagnostic data.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve sleep records' });
  }
});

// POST /api/sleep
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = sleepSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const { bedtime, wakeTime, sleepQuality, source, notes } = parse.data;
    const bedDate = new Date(bedtime);
    const wakeDate = new Date(wakeTime);

    let duration = parse.data.durationMinutes;
    if (!duration) {
      duration = Math.max(0, Math.round((wakeDate.getTime() - bedDate.getTime()) / 60000));
    }

    const record = await prisma.sleepRecord.create({
      data: {
        userId: req.user!.id,
        bedtime: bedDate,
        wakeTime: wakeDate,
        durationMinutes: duration,
        sleepQuality: sleepQuality || null,
        source: source || 'manual',
        notes: notes || null
      }
    });

    res.status(201).json({ message: 'Sleep record logged successfully', record });
  } catch (error) {
    console.error('Error logging sleep:', error);
    res.status(500).json({ error: 'Failed to log sleep record' });
  }
});

// PUT /api/sleep/:id
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const parse = sleepSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const existing = await prisma.sleepRecord.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      res.status(404).json({ error: 'Sleep record not found' });
      return;
    }

    const bedDate = new Date(parse.data.bedtime);
    const wakeDate = new Date(parse.data.wakeTime);
    const duration = parse.data.durationMinutes || Math.max(0, Math.round((wakeDate.getTime() - bedDate.getTime()) / 60000));

    const updated = await prisma.sleepRecord.update({
      where: { id },
      data: {
        bedtime: bedDate,
        wakeTime: wakeDate,
        durationMinutes: duration,
        sleepQuality: parse.data.sleepQuality,
        source: parse.data.source,
        notes: parse.data.notes
      }
    });

    res.json({ message: 'Sleep record updated successfully', record: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update sleep record' });
  }
});

// DELETE /api/sleep/:id
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.sleepRecord.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existing) {
      res.status(404).json({ error: 'Sleep record not found' });
      return;
    }

    await prisma.sleepRecord.delete({ where: { id } });
    res.json({ message: 'Sleep record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete sleep record' });
  }
});

export default router;
