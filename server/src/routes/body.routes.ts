import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { calculateBMI } from '../utils/calculations.js';

const router = Router();

const measurementSchema = z.object({
  weightKg: z.number().positive().optional().nullable(),
  waistCm: z.number().positive().optional().nullable(),
  hipCm: z.number().positive().optional().nullable(),
  neckCm: z.number().positive().optional().nullable(),
  bodyFatPercentage: z.number().min(3).max(65).optional().nullable(),
  muscleMassKg: z.number().positive().optional().nullable(),
  recordedAt: z.string().optional(),
  source: z.string().default('manual'),
  notes: z.string().optional().nullable(),
});

// GET /api/body-measurements
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const measurements = await prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' }
    });

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { heightCm: true }
    });

    const targetWeightGoal = await prisma.userGoal.findFirst({
      where: { userId, goalType: 'target_weight', isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    const latest = measurements[0] || null;
    let bmiData = null;
    if (latest?.weightKg && userProfile?.heightCm) {
      bmiData = calculateBMI(latest.weightKg, userProfile.heightCm);
    }

    // Calculate weight trend if at least 2 records exist
    let weightTrendKg = 0;
    if (measurements.length >= 2 && latest?.weightKg && measurements[1]?.weightKg) {
      weightTrendKg = parseFloat((latest.weightKg - measurements[1].weightKg).toFixed(1));
    }

    res.json({
      latest,
      heightCm: userProfile?.heightCm || null,
      bmi: bmiData,
      targetWeightKg: targetWeightGoal?.targetValue || null,
      weightTrendKg,
      history: measurements
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve body measurements' });
  }
});

// POST /api/body-measurements
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = measurementSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const { recordedAt, ...data } = parse.data;
    const record = await prisma.bodyMeasurement.create({
      data: {
        userId: req.user!.id,
        ...data,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date()
      }
    });

    res.status(201).json({ message: 'Measurement recorded successfully', measurement: record });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record body measurement' });
  }
});

// PUT /api/body-measurements/:id
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parse = measurementSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const existing = await prisma.bodyMeasurement.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existing) {
      res.status(404).json({ error: 'Measurement record not found or unauthorized' });
      return;
    }

    const { recordedAt, ...data } = parse.data;
    const updated = await prisma.bodyMeasurement.update({
      where: { id },
      data: {
        ...data,
        recordedAt: recordedAt ? new Date(recordedAt) : undefined
      }
    });

    res.json({ message: 'Measurement updated successfully', measurement: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update body measurement' });
  }
});

// DELETE /api/body-measurements/:id
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.bodyMeasurement.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existing) {
      res.status(404).json({ error: 'Measurement record not found or unauthorized' });
      return;
    }

    await prisma.bodyMeasurement.delete({ where: { id } });
    res.json({ message: 'Measurement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete body measurement' });
  }
});

export default router;
