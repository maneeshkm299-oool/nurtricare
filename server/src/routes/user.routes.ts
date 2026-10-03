import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  dateOfBirth: z.string().optional().nullable(),
  heightCm: z.number().positive().optional().nullable(),
  gender: z.string().optional().nullable(),
  activityLevel: z.string().optional().nullable(),
  fitnessGoal: z.string().optional().nullable(),
  dietaryPreference: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  foodDislikes: z.string().optional().nullable(),
  preferredUnits: z.string().optional().nullable(),
  timeZone: z.string().optional().nullable(),
});

// GET /api/users/profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        profile: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PUT /api/users/profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = profileUpdateSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const { name, ...profileFields } = parse.data;

    if (name) {
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { name }
      });
    }

    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: req.user!.id },
      update: {
        dateOfBirth: profileFields.dateOfBirth ? new Date(profileFields.dateOfBirth) : undefined,
        heightCm: profileFields.heightCm,
        gender: profileFields.gender,
        activityLevel: profileFields.activityLevel,
        fitnessGoal: profileFields.fitnessGoal,
        dietaryPreference: profileFields.dietaryPreference,
        allergies: profileFields.allergies,
        foodDislikes: profileFields.foodDislikes,
        preferredUnits: profileFields.preferredUnits,
        timeZone: profileFields.timeZone
      },
      create: {
        userId: req.user!.id,
        dateOfBirth: profileFields.dateOfBirth ? new Date(profileFields.dateOfBirth) : null,
        heightCm: profileFields.heightCm,
        gender: profileFields.gender,
        activityLevel: profileFields.activityLevel,
        fitnessGoal: profileFields.fitnessGoal,
        dietaryPreference: profileFields.dietaryPreference,
        allergies: profileFields.allergies,
        foodDislikes: profileFields.foodDislikes,
        preferredUnits: profileFields.preferredUnits || 'metric',
        timeZone: profileFields.timeZone || 'Asia/Kolkata'
      }
    });

    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/users/export-all (Complete personal health data export in JSON)
router.get('/export-all', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        profile: true,
        bodyMeasurements: true,
        activityLogs: true,
        dailySummaries: true,
        workouts: { include: { exercises: true } },
        heartRates: true,
        sleepRecords: true,
        mealLogs: { include: { items: true } },
        dietPlans: true,
        waterEntries: true,
        wellnessLogs: true,
        goals: true
      }
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=nutricare-export-${Date.now()}.json`);
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export user data' });
  }
});

// DELETE /api/users/account (Privacy: Account and all associated data deletion)
router.delete('/account', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    await prisma.user.delete({
      where: { id: userId }
    });
    res.json({ message: 'User account and all health data deleted permanently.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user account' });
  }
});

export default router;
