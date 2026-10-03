import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  heightCm: z.number().positive().optional(),
  initialWeightKg: z.number().positive().optional(),
  targetWeightKg: z.number().positive().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  activityLevel: z.string().optional(),
  fitnessGoal: z.string().optional(),
  dietaryPreference: z.string().optional(),
  allergies: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const {
      name,
      email,
      password,
      heightCm,
      initialWeightKg,
      targetWeightKg,
      dateOfBirth,
      gender,
      activityLevel,
      fitnessGoal,
      dietaryPreference,
      allergies
    } = parse.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      res.status(409).json({ error: 'User with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        profile: {
          create: {
            heightCm: heightCm || null,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            gender: gender || null,
            activityLevel: activityLevel || 'moderately_active',
            fitnessGoal: fitnessGoal || 'weight_loss',
            dietaryPreference: dietaryPreference || 'vegetarian',
            allergies: allergies || null,
          }
        }
      },
      include: {
        profile: true
      }
    });

    // If initial weight provided, record first body measurement and weight goal
    if (initialWeightKg) {
      await prisma.bodyMeasurement.create({
        data: {
          userId: user.id,
          weightKg: initialWeightKg,
          source: 'manual',
          notes: 'Initial weight recorded during profile setup'
        }
      });
    }

    if (targetWeightKg) {
      await prisma.userGoal.create({
        data: {
          userId: user.id,
          goalType: 'target_weight',
          targetValue: targetWeightKg,
          unit: 'kg',
          isActive: true
        }
      });
    }

    // Default goals
    await prisma.userGoal.createMany({
      data: [
        { userId: user.id, goalType: 'daily_steps', targetValue: 10000, unit: 'steps' },
        { userId: user.id, goalType: 'water_intake', targetValue: 2500, unit: 'ml' },
        { userId: user.id, goalType: 'sleep_duration', targetValue: 480, unit: 'minutes' },
        { userId: user.id, goalType: 'workout_frequency', targetValue: 4, unit: 'days/week' }
      ]
    });

    const secret = process.env.JWT_SECRET || 'nutricare_secure_jwt_token_secret_key_2026_super_private';
    const token = jwt.sign({ id: user.id, email: user.email }, secret, {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'Account successfully created',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Invalid email or password format' });
      return;
    }

    const { email, password } = parse.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true }
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'nutricare_secure_jwt_token_secret_key_2026_super_private';
    const token = jwt.sign({ id: user.id, email: user.email }, secret, {
      expiresIn: '7d'
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  // Stateless JWT: client clears token from storage
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
});

export default router;
