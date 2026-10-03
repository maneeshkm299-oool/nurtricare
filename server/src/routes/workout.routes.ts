import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const exerciseSchema = z.object({
  exerciseName: z.string().min(1),
  sets: z.number().int().positive(),
  repetitions: z.number().int().positive().optional().nullable(),
  weightKg: z.number().nonnegative().optional().nullable(),
  distanceMeters: z.number().nonnegative().optional().nullable(),
  durationSeconds: z.number().int().nonnegative().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const workoutSchema = z.object({
  workoutType: z.string().min(1),
  title: z.string().min(1),
  startedAt: z.string().optional(),
  endedAt: z.string().optional().nullable(),
  durationMinutes: z.number().int().positive(),
  notes: z.string().optional().nullable(),
  exercises: z.array(exerciseSchema).optional(),
});

// GET /api/workouts
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const workouts = await prisma.workout.findMany({
      where: { userId },
      include: { exercises: true },
      orderBy: { startedAt: 'desc' }
    });

    res.json({ workouts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve workouts' });
  }
});

// POST /api/workouts
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = workoutSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const userId = req.user!.id;
    const { exercises, startedAt, endedAt, ...rest } = parse.data;

    const workout = await prisma.workout.create({
      data: {
        userId,
        ...rest,
        startedAt: startedAt ? new Date(startedAt) : new Date(),
        endedAt: endedAt ? new Date(endedAt) : null,
        exercises: exercises && exercises.length > 0 ? {
          create: exercises.map(ex => ({
            exerciseName: ex.exerciseName,
            sets: ex.sets,
            repetitions: ex.repetitions || null,
            weightKg: ex.weightKg || null,
            distanceMeters: ex.distanceMeters || null,
            durationSeconds: ex.durationSeconds || null,
            notes: ex.notes || null,
          }))
        } : undefined
      },
      include: { exercises: true }
    });

    res.status(201).json({ message: 'Workout created successfully', workout });
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ error: 'Failed to create workout' });
  }
});

// GET /api/workouts/:id
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const workout = await prisma.workout.findFirst({
      where: { id, userId: req.user!.id },
      include: { exercises: true }
    });

    if (!workout) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }

    res.json({ workout });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve workout' });
  }
});

// PUT /api/workouts/:id
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const parse = workoutSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const existing = await prisma.workout.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }

    const { exercises, startedAt, endedAt, ...rest } = parse.data;

    // Delete existing exercises and recreate them if provided
    if (exercises) {
      await prisma.workoutExercise.deleteMany({ where: { workoutId: id } });
    }

    const updated = await prisma.workout.update({
      where: { id },
      data: {
        ...rest,
        startedAt: startedAt ? new Date(startedAt) : existing.startedAt,
        endedAt: endedAt ? new Date(endedAt) : existing.endedAt,
        exercises: exercises ? {
          create: exercises.map(ex => ({
            exerciseName: ex.exerciseName,
            sets: ex.sets,
            repetitions: ex.repetitions || null,
            weightKg: ex.weightKg || null,
            distanceMeters: ex.distanceMeters || null,
            durationSeconds: ex.durationSeconds || null,
            notes: ex.notes || null,
          }))
        } : undefined
      },
      include: { exercises: true }
    });

    res.json({ message: 'Workout updated successfully', workout: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update workout' });
  }
});

// DELETE /api/workouts/:id
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.workout.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existing) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }

    await prisma.workout.delete({ where: { id } });
    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete workout' });
  }
});

export default router;
