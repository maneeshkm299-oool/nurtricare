import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { calculateAge, calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacroSplit } from '../utils/calculations.js';

const router = Router();

const customFoodSchema = z.object({
  name: z.string().min(1),
  servingSize: z.number().positive(),
  servingUnit: z.string().min(1),
  calories: z.number().nonnegative(),
  proteinGrams: z.number().nonnegative(),
  carbohydrateGrams: z.number().nonnegative(),
  fatGrams: z.number().nonnegative(),
  fiberGrams: z.number().nonnegative().default(0),
  category: z.string().default('general'),
  dietaryClassification: z.string().default('veg'),
});

const mealItemSchema = z.object({
  foodId: z.string().optional().nullable(),
  foodNameSnapshot: z.string().min(1),
  quantity: z.number().positive(),
  servingUnit: z.string().min(1),
  calories: z.number().nonnegative(),
  proteinGrams: z.number().nonnegative(),
  carbohydrateGrams: z.number().nonnegative(),
  fatGrams: z.number().nonnegative(),
  fiberGrams: z.number().nonnegative(),
});

const mealLogSchema = z.object({
  mealType: z.enum(['breakfast', 'morning_snack', 'lunch', 'evening_snack', 'dinner']),
  loggedAt: z.string().optional(),
  notes: z.string().optional().nullable(),
  items: z.array(mealItemSchema).min(1, 'At least one food item must be included'),
});

// GET /api/foods
router.get('/foods', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string || '').toLowerCase().trim();
    const category = req.query.category as string;
    const classification = req.query.classification as string;

    const whereClause: any = {
      OR: [
        { isCustom: false },
        { createdByUserId: req.user!.id }
      ]
    };

    if (q) {
      whereClause.name = { contains: q };
    }
    if (category) {
      whereClause.category = category;
    }
    if (classification) {
      whereClause.dietaryClassification = classification;
    }

    const foods = await prisma.food.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      take: 100
    });

    res.json({ foods });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search foods' });
  }
});

// POST /api/foods/custom
router.post('/foods/custom', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = customFoodSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const food = await prisma.food.create({
      data: {
        ...parse.data,
        isCustom: true,
        createdByUserId: req.user!.id
      }
    });

    res.status(201).json({ message: 'Custom food item added successfully', food });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save custom food item' });
  }
});

// GET /api/meals
router.get('/meals', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const meals = await prisma.mealLog.findMany({
      where: {
        userId,
        loggedAt: { gte: startOfDay, lte: endOfDay }
      },
      include: { items: true },
      orderBy: { loggedAt: 'asc' }
    });

    res.json({ date: dateStr, meals });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve meal logs' });
  }
});

// POST /api/meals
router.post('/meals', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = mealLogSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const userId = req.user!.id;
    const { mealType, loggedAt, notes, items } = parse.data;

    const meal = await prisma.mealLog.create({
      data: {
        userId,
        mealType,
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
        notes: notes || null,
        items: {
          create: items.map(item => ({
            foodId: item.foodId || null,
            foodNameSnapshot: item.foodNameSnapshot,
            quantity: item.quantity,
            servingUnit: item.servingUnit,
            calories: item.calories,
            proteinGrams: item.proteinGrams,
            carbohydrateGrams: item.carbohydrateGrams,
            fatGrams: item.fatGrams,
            fiberGrams: item.fiberGrams
          }))
        }
      },
      include: { items: true }
    });

    res.status(201).json({ message: 'Meal logged successfully', meal });
  } catch (error) {
    console.error('Error logging meal:', error);
    res.status(500).json({ error: 'Failed to log meal' });
  }
});

// PUT /api/meals/:id
router.put('/meals/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const parse = mealLogSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const existing = await prisma.mealLog.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      res.status(404).json({ error: 'Meal log not found' });
      return;
    }

    const { mealType, loggedAt, notes, items } = parse.data;

    // Delete previous items
    await prisma.mealLogItem.deleteMany({ where: { mealLogId: id } });

    const updated = await prisma.mealLog.update({
      where: { id },
      data: {
        mealType,
        loggedAt: loggedAt ? new Date(loggedAt) : existing.loggedAt,
        notes: notes || null,
        items: {
          create: items.map(item => ({
            foodId: item.foodId || null,
            foodNameSnapshot: item.foodNameSnapshot,
            quantity: item.quantity,
            servingUnit: item.servingUnit,
            calories: item.calories,
            proteinGrams: item.proteinGrams,
            carbohydrateGrams: item.carbohydrateGrams,
            fatGrams: item.fatGrams,
            fiberGrams: item.fiberGrams
          }))
        }
      },
      include: { items: true }
    });

    res.json({ message: 'Meal log updated successfully', meal: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update meal log' });
  }
});

// DELETE /api/meals/:id
router.delete('/meals/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.mealLog.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existing) {
      res.status(404).json({ error: 'Meal log not found' });
      return;
    }

    await prisma.mealLog.delete({ where: { id } });
    res.json({ message: 'Meal log deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete meal log' });
  }
});

// GET /api/nutrition/daily-summary
router.get('/daily-summary', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const meals = await prisma.mealLog.findMany({
      where: {
        userId,
        loggedAt: { gte: startOfDay, lte: endOfDay }
      },
      include: { items: true }
    });

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;

    const breakdownByMeal: Record<string, number> = {
      breakfast: 0,
      morning_snack: 0,
      lunch: 0,
      evening_snack: 0,
      dinner: 0
    };

    for (const meal of meals) {
      for (const item of meal.items) {
        totalCalories += item.calories;
        totalProtein += item.proteinGrams;
        totalCarbs += item.carbohydrateGrams;
        totalFat += item.fatGrams;
        totalFiber += item.fiberGrams;
        if (breakdownByMeal[meal.mealType] !== undefined) {
          breakdownByMeal[meal.mealType] += item.calories;
        }
      }
    }

    // Fetch user profile & latest weight to calculate personalized targets
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const latestBody = await prisma.bodyMeasurement.findFirst({
      where: { userId },
      orderBy: { recordedAt: 'desc' }
    });

    const weight = latestBody?.weightKg || 70;
    const height = profile?.heightCm || 170;
    const age = profile?.dateOfBirth ? calculateAge(profile.dateOfBirth) : 30;
    const bmr = calculateBMR(weight, height, age, profile?.gender);
    const tdee = calculateTDEE(bmr, profile?.activityLevel);
    const targetCalories = calculateTargetCalories(tdee, profile?.fitnessGoal);
    const targetMacros = calculateMacroSplit(targetCalories, profile?.fitnessGoal);

    res.json({
      date: dateStr,
      consumed: {
        calories: Math.round(totalCalories),
        proteinGrams: parseFloat(totalProtein.toFixed(1)),
        carbohydrateGrams: parseFloat(totalCarbs.toFixed(1)),
        fatGrams: parseFloat(totalFat.toFixed(1)),
        fiberGrams: parseFloat(totalFiber.toFixed(1)),
      },
      targets: {
        dailyCalories: targetCalories,
        proteinGrams: targetMacros.proteinGrams,
        carbohydrateGrams: targetMacros.carbohydrateGrams,
        fatGrams: targetMacros.fatGrams,
        fiberGrams: 30
      },
      remainingCalories: Math.max(0, targetCalories - Math.round(totalCalories)),
      breakdownByMeal,
      mealCount: meals.length
    });
  } catch (error) {
    console.error('Error fetching nutrition summary:', error);
    res.status(500).json({ error: 'Failed to calculate daily nutrition summary' });
  }
});

export default router;
