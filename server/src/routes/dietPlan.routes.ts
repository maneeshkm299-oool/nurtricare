import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { calculateAge, calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacroSplit } from '../utils/calculations.js';

const router = Router();

const generatePlanSchema = z.object({
  title: z.string().optional(),
  overrideGoal: z.string().optional(),
  overrideDietaryPreference: z.string().optional(),
  mealFrequency: z.number().int().min(3).max(6).default(4),
  workoutRoutine: z.string().optional(),
});

// GET /api/diet-plans
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const plans = await prisma.dietPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const parsedPlans = plans.map(p => ({
      ...p,
      planData: JSON.parse(p.planData)
    }));

    res.json({ plans: parsedPlans });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve diet plans' });
  }
});

// POST /api/diet-plans/generate
router.post('/generate', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const parse = generatePlanSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const latestBody = await prisma.bodyMeasurement.findFirst({
      where: { userId },
      orderBy: { recordedAt: 'desc' }
    });

    const weight = latestBody?.weightKg || 70;
    const height = profile?.heightCm || 170;
    const age = profile?.dateOfBirth ? calculateAge(profile.dateOfBirth) : 28;
    const gender = profile?.gender;
    const activityLevel = profile?.activityLevel || 'moderately_active';
    const goal = parse.data.overrideGoal || profile?.fitnessGoal || 'weight_loss';
    const dietaryPreference = parse.data.overrideDietaryPreference || profile?.dietaryPreference || 'vegetarian';
    const allergies = (profile?.allergies || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    const dislikes = (profile?.foodDislikes || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

    // Compute energy needs
    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const targetCalories = calculateTargetCalories(tdee, goal);
    const macros = calculateMacroSplit(targetCalories, goal);

    // Dynamic intelligent meal generator adhering to dietary preference and allergies
    const isVeg = dietaryPreference === 'vegetarian' || dietaryPreference === 'vegan' || dietaryPreference === 'jain';
    const isVegan = dietaryPreference === 'vegan';
    const hasNutAllergy = allergies.includes('nuts') || allergies.includes('peanuts');
    const hasDairyAllergy = allergies.includes('dairy') || allergies.includes('milk') || isVegan;

    // Breakfast choices
    const breakfast = [
      {
        name: 'Idli (3 steamed cakes) with Sambar & Fresh Coconut Chutney',
        calories: 310,
        protein: 8,
        carbs: 52,
        fat: 7,
        prep: 'Steam fermented rice and black gram batter. Serve hot with lentil vegetable stew (sambar).',
        alternatives: 'Whole Wheat Vegetable Upma or Poha with roasted peanuts (omit peanuts if allergic).'
      },
      {
        name: hasDairyAllergy ? 'Warm Almond Milk / Spiced Ragi Porridge' : 'Warm Turmeric Milk with Pinch of Cardamom',
        calories: 110,
        protein: 5,
        carbs: 14,
        fat: 4,
        prep: 'Simmer gently with a dash of black pepper and turmeric for anti-inflammatory recovery.',
        alternatives: 'Green Tea with lemon or warm herbal infusion.'
      }
    ];

    // Morning Snack
    const morningSnack = [
      {
        name: hasNutAllergy ? 'Fresh Papaya & Seasonal Apple Slices' : 'Walnuts (15g) and Fresh Apple Slices',
        calories: hasNutAllergy ? 95 : 160,
        protein: hasNutAllergy ? 1.5 : 4,
        carbs: 22,
        fat: hasNutAllergy ? 0.3 : 9,
        prep: 'Rinse fresh fruits and serve raw without added sugars.',
        alternatives: 'Pomegranate arils or tender coconut water.'
      }
    ];

    // Lunch choices
    const lunch = [
      {
        name: '2 Phulkas (Whole Wheat Rotis) with Yellow Dal Tadka',
        calories: 320,
        protein: 14,
        carbs: 54,
        fat: 5,
        prep: 'Lightly roasted whole wheat rotis served with cumin and garlic tempered toor dal.',
        alternatives: '1 cup Cooked Brown Rice with Palak Dal.'
      },
      {
        name: hasDairyAllergy ? 'Steamed Moong Sprouts Sabzi with Coriander' : 'Fresh Homemade Curd (150g) or Light Paneer Bhurji',
        calories: hasDairyAllergy ? 120 : 170,
        protein: hasDairyAllergy ? 8 : 12,
        carbs: 10,
        fat: hasDairyAllergy ? 1 : 10,
        prep: 'Whisk curd chilled or lightly scramble paneer with diced tomatoes and bell peppers.',
        alternatives: isVeg ? 'Tofu stir-fry' : 'Grilled Chicken Breast (120g).'
      },
      {
        name: 'Crisp Green Cucumber, Radish & Tomato Salad',
        calories: 40,
        protein: 1.5,
        carbs: 8,
        fat: 0.2,
        prep: 'Toss diced vegetables with a squeeze of fresh lime juice and pink salt.',
        alternatives: 'Carrot and beet sticks.'
      }
    ];

    // Evening Snack
    const eveningSnack = [
      {
        name: 'Roasted Moong Sprouts Chaat with Lemon & Herbs',
        calories: 140,
        protein: 9,
        carbs: 22,
        fat: 1.2,
        prep: 'Mix steamed sprouted green gram with chopped onions, tomatoes, and chaat masala.',
        alternatives: 'Roasted Makhana (Foxnuts) with rock salt or boiled chana.'
      }
    ];

    // Dinner choices
    const dinner = [
      {
        name: 'Ragi Mudde (Finger Millet Ball) or 2 Multi-grain Rotis',
        calories: 220,
        protein: 6,
        carbs: 48,
        fat: 1.2,
        prep: 'Traditional Karnataka superfood made with nutrient-rich finger millet.',
        alternatives: 'Quinoa khichdi or 1.5 cups steamed brown rice.'
      },
      {
        name: isVeg
          ? (hasDairyAllergy ? 'Chana Masala with Methi Leaves' : 'Sauteed Palak Paneer or Dal Makhani (low-butter)')
          : 'Grilled Herb Fish Fillet / Lemon Pepper Chicken (150g)',
        calories: isVeg ? 240 : 260,
        protein: isVeg ? 12 : 28,
        carbs: isVeg ? 18 : 2,
        fat: isVeg ? 15 : 12,
        prep: 'Slow-cooked with whole spices for optimal digestive warmth.',
        alternatives: 'Mixed vegetable sambar with edamame or soybean curry.'
      },
      {
        name: 'Tomato & Black Pepper Rasam (1 bowl)',
        calories: 55,
        protein: 1.5,
        carbs: 9,
        fat: 1.5,
        prep: 'Traditional South Indian digestive broth made with tamarind, fresh tomatoes, cumin, and garlic.',
        alternatives: 'Clear vegetable broth or ginger-infused warm water.'
      }
    ];

    const planData = {
      userContext: {
        weightKg: weight,
        heightCm: height,
        age,
        fitnessGoal: goal,
        activityLevel,
        dietaryPreference,
        allergies: allergies.length > 0 ? allergies : ['None reported'],
        dislikes: dislikes.length > 0 ? dislikes : ['None reported']
      },
      energyRequirements: {
        bmrKcal: bmr,
        tdeeKcal: tdee,
        targetDailyCalories: targetCalories,
        macroTargets: macros
      },
      meals: {
        breakfast,
        morningSnack,
        lunch,
        eveningSnack,
        dinner
      },
      alternatives: [
        { item: 'Idli / Dosa', suggestion: 'Ragi Porridge, Oats Khichdi, or Moong Dal Cheela' },
        { item: 'Paneer / Dairy', suggestion: 'Firm Tofu, Edamame, or Tempeh for plant-based calcium & protein' },
        { item: 'White Rice', suggestion: 'Brown Rice, Foxtail Millet, or Quinoa for higher fiber glycemic control' }
      ],
      medicalDisclaimer: 'NutriCare diet recommendations are developed from standard nutritional reference values. They avoid extreme calorie deficits. If you have medical conditions, diabetes, hypertension, or are pregnant, consult a registered dietitian or licensed medical professional.'
    };

    const title = parse.data.title || `Personalized ${goal.replace(/_/g, ' ').toUpperCase()} Plan (${targetCalories} kcal)`;

    const savedPlan = await prisma.dietPlan.create({
      data: {
        userId,
        title,
        goal,
        dailyCalorieTarget: targetCalories,
        planData: JSON.stringify(planData)
      }
    });

    res.status(201).json({
      message: 'Personalized meal plan generated and saved successfully',
      plan: {
        ...savedPlan,
        planData
      }
    });
  } catch (error) {
    console.error('Error generating diet plan:', error);
    res.status(500).json({ error: 'Failed to generate personalized diet plan' });
  }
});

// GET /api/diet-plans/:id
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await prisma.dietPlan.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!plan) {
      res.status(404).json({ error: 'Diet plan not found' });
      return;
    }

    res.json({
      plan: {
        ...plan,
        planData: JSON.parse(plan.planData)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve diet plan' });
  }
});

// DELETE /api/diet-plans/:id
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.dietPlan.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existing) {
      res.status(404).json({ error: 'Diet plan not found' });
      return;
    }

    await prisma.dietPlan.delete({ where: { id } });
    res.json({ message: 'Diet plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete diet plan' });
  }
});

export default router;
