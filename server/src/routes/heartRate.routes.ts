import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const heartRateSchema = z.object({
  heartRateBpm: z.number().int().min(30).max(240),
  measurementType: z.enum(['resting', 'exercise', 'recovery', 'general']),
  recordedAt: z.string().optional(),
  source: z.string().default('manual'),
  notes: z.string().optional().nullable(),
});

// GET /api/heart-rate
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const records = await prisma.heartRateRecord.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
      take: 100
    });

    // Compute resting average
    const restingRecords = records.filter(r => r.measurementType === 'resting');
    const restingAvg = restingRecords.length > 0
      ? Math.round(restingRecords.reduce((sum, r) => sum + r.heartRateBpm, 0) / restingRecords.length)
      : null;

    res.json({
      records,
      latest: records[0] || null,
      restingAverageBpm: restingAvg,
      disclaimer: 'NutriCare heart-rate records are for lifestyle and fitness monitoring only and are not intended for clinical diagnosis.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve heart rate records' });
  }
});

// POST /api/heart-rate
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = heartRateSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const { recordedAt, ...rest } = parse.data;
    const record = await prisma.heartRateRecord.create({
      data: {
        userId: req.user!.id,
        ...rest,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date()
      }
    });

    res.status(201).json({ message: 'Heart rate recorded successfully', record });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record heart rate' });
  }
});

// DELETE /api/heart-rate/:id
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.heartRateRecord.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existing) {
      res.status(404).json({ error: 'Heart rate record not found' });
      return;
    }

    await prisma.heartRateRecord.delete({ where: { id } });
    res.json({ message: 'Heart rate record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete heart rate record' });
  }
});

export default router;
