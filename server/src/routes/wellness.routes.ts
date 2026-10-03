import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const wellnessSchema = z.object({
  moodScore: z.number().int().min(1).max(10).optional().nullable(),
  energyScore: z.number().int().min(1).max(10).optional().nullable(),
  stressScore: z.number().int().min(1).max(10).optional().nullable(),
  sorenessScore: z.number().int().min(1).max(10).optional().nullable(),
  recoveryScore: z.number().int().min(1).max(10).optional().nullable(),
  notes: z.string().optional().nullable(),
  recordedAt: z.string().optional(),
});

// GET /api/wellness
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const logs = await prisma.wellnessLog.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
      take: 60
    });

    res.json({
      logs,
      latest: logs[0] || null,
      disclaimer: 'NutriCare wellness journal observations represent self-reported perceptions of daily energy, mood, and recovery to help you reflect on lifestyle patterns.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve wellness logs' });
  }
});

// POST /api/wellness
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = wellnessSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const { recordedAt, ...data } = parse.data;
    const log = await prisma.wellnessLog.create({
      data: {
        userId: req.user!.id,
        ...data,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date()
      }
    });

    res.status(201).json({ message: 'Wellness entry saved successfully', log });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save wellness entry' });
  }
});

// PUT /api/wellness/:id
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parse = wellnessSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const existing = await prisma.wellnessLog.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existing) {
      res.status(404).json({ error: 'Wellness entry not found' });
      return;
    }

    const { recordedAt, ...data } = parse.data;
    const updated = await prisma.wellnessLog.update({
      where: { id },
      data: {
        ...data,
        recordedAt: recordedAt ? new Date(recordedAt) : existing.recordedAt
      }
    });

    res.json({ message: 'Wellness entry updated successfully', log: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update wellness entry' });
  }
});

// DELETE /api/wellness/:id
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.wellnessLog.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existing) {
      res.status(404).json({ error: 'Wellness entry not found' });
      return;
    }

    await prisma.wellnessLog.delete({ where: { id } });
    res.json({ message: 'Wellness entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete wellness entry' });
  }
});

export default router;
