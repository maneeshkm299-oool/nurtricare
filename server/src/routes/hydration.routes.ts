import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const waterSchema = z.object({
  amountMl: z.number().int().positive(),
  recordedAt: z.string().optional(),
});

// GET /api/water
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const entries = await prisma.waterEntry.findMany({
      where: {
        userId,
        recordedAt: { gte: startOfDay, lte: endOfDay }
      },
      orderBy: { recordedAt: 'asc' }
    });

    const waterGoal = await prisma.userGoal.findFirst({
      where: { userId, goalType: 'water_intake', isActive: true }
    });

    const totalMl = entries.reduce((sum, e) => sum + e.amountMl, 0);
    const goalMl = waterGoal?.targetValue || 2500;
    const remainingMl = Math.max(0, goalMl - totalMl);
    const progressPercent = Math.min(100, Math.round((totalMl / goalMl) * 100));

    res.json({
      date: dateStr,
      totalMl,
      goalMl,
      remainingMl,
      progressPercent,
      entries
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve hydration data' });
  }
});

// POST /api/water
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = waterSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const { amountMl, recordedAt } = parse.data;
    const entry = await prisma.waterEntry.create({
      data: {
        userId: req.user!.id,
        amountMl,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date()
      }
    });

    res.status(201).json({ message: 'Water intake logged', entry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log water intake' });
  }
});

// PUT /api/water/:id
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parse = waterSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const existing = await prisma.waterEntry.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existing) {
      res.status(404).json({ error: 'Water entry not found' });
      return;
    }

    const updated = await prisma.waterEntry.update({
      where: { id },
      data: {
        amountMl: parse.data.amountMl,
        recordedAt: parse.data.recordedAt ? new Date(parse.data.recordedAt) : existing.recordedAt
      }
    });

    res.json({ message: 'Water entry updated', entry: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update water entry' });
  }
});

// DELETE /api/water/:id
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.waterEntry.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existing) {
      res.status(404).json({ error: 'Water entry not found' });
      return;
    }

    await prisma.waterEntry.delete({ where: { id } });
    res.json({ message: 'Water entry deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete water entry' });
  }
});

export default router;
