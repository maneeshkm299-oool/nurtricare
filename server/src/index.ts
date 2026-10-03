import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import bodyRoutes from './routes/body.routes.js';
import activityRoutes from './routes/activity.routes.js';
import workoutRoutes from './routes/workout.routes.js';
import heartRateRoutes from './routes/heartRate.routes.js';
import sleepRoutes from './routes/sleep.routes.js';
import nutritionRoutes from './routes/nutrition.routes.js';
import dietPlanRoutes from './routes/dietPlan.routes.js';
import hydrationRoutes from './routes/hydration.routes.js';
import wellnessRoutes from './routes/wellness.routes.js';
import goalsRoutes from './routes/goals.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import dataSourceRoutes from './routes/dataSource.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: [corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'NutriCare Health & Nutrition Backend API',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes exactly as per specifications
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/body-measurements', bodyRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/heart-rate', heartRateRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api', nutritionRoutes); // exposes /api/foods and /api/meals
app.use('/api/nutrition', nutritionRoutes); // exposes /api/nutrition/daily-summary
app.use('/api/diet-plans', dietPlanRoutes);
app.use('/api/water', hydrationRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/data-sources', dataSourceRoutes);

// Serve static frontend build if it exists (for cloud deployments)
const clientDistPath = path.resolve(process.cwd(), '../client/dist');
const altClientDistPath = path.resolve(process.cwd(), 'client/dist');
const resolvedDist = fs.existsSync(clientDistPath) ? clientDistPath : (fs.existsSync(altClientDistPath) ? altClientDistPath : null);

if (resolvedDist) {
  app.use(express.static(resolvedDist));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(resolvedDist, 'index.html'));
  });
}

// Centralized 404 handler for API routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Centralized error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[NutriCare Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  🌿 NutriCare Backend Server Running on Port ${PORT}`);
    console.log(`  🔗 REST API Base: http://localhost:${PORT}/api`);
    console.log(`  🩺 Health Check:  http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}

export default app;
