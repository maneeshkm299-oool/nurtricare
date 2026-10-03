# 🌿 NUTRICARE – Complete Project Delivery & Runbook

NutriCare is a production-grade full-stack Body Health, Nutrition & Activity Monitoring web application built with **React + Vite + TypeScript + Tailwind CSS** on the frontend, and **Node.js + Express + Prisma ORM + SQLite (with PostgreSQL schema ready)** on the backend.

---

## 1. Project Directory Structure & Order

The complete codebase is stored in your workspace at:
`C:\Users\MANEESH\.gemini\antigravity\scratch\nutricare\`

```
nutricare/
├── package.json                 # Monorepo root scripts & dev setup
├── PROJECT_SUMMARY.md           # This document
│
├── client/                      # Frontend Application (React + Vite + Tailwind)
│   ├── index.html               # App shell, responsive meta tags, Inter font
│   ├── package.json             # React 18, Vite, Lucide Icons, Recharts
│   ├── vite.config.ts           # Dev server config & /api proxy to port 5000
│   ├── tailwind.config.js       # Custom NutriCare green/cream theme tokens
│   ├── postcss.config.js        # PostCSS configuration
│   └── src/
│       ├── main.tsx             # React root mount
│       ├── App.tsx              # Main layout, tab navigation, auth gate
│       ├── index.css            # Tailwind directives, theme variables
│       ├── types/index.ts       # Full TypeScript interfaces for all 18 models
│       ├── utils/cn.ts          # Class merging utility
│       ├── context/
│       │   ├── AuthContext.tsx  # JWT authentication, session persistence
│       │   └── ThemeContext.tsx # Light & Dark mode support
│       ├── services/
│       │   └── api.ts           # Unified API service layer with JWT interceptor
│       ├── components/
│       │   ├── layout/          # Sidebar, Navbar, MobileNav, AppLayout
│       │   └── common/          # MetricCard, Modal, ProgressBar, Badge
│       └── pages/               # 11 Dedicated Application Views
│           ├── AuthPage.tsx             # Login & Registration
│           ├── DashboardPage.tsx        # Daily Health & Wellness Overview
│           ├── BodyMonitoringPage.tsx   # Weight, BMI, Body Fat, Waist/Hip
│           ├── ActivityTrackingPage.tsx # Steps, MET Calories, Distance, Active min
│           ├── NutritionDietPage.tsx    # Indian Food DB, Meal logging (5 meals)
│           ├── WorkoutsPage.tsx         # Workout routines, sets, reps, weight
│           ├── SleepPage.tsx            # Sleep duration, consistency, quality
│           ├── HydrationPage.tsx        # Water intake, quick add, daily goal
│           ├── ReportsPage.tsx          # Weekly/monthly charts & CSV export
│           ├── GoalsAchievementsPage.tsx# Goals, streaks, and milestones
│           └── ProfileSettingsPage.tsx  # Profile, units, data export & deletion
│
└── server/                      # Backend Application (Node.js + Express + Prisma)
    ├── package.json             # Express, Prisma, JWT, Bcrypt, Vitest
    ├── tsconfig.json            # Node.js TypeScript configuration
    ├── .env                     # SQLite DATABASE_URL, PORT=5000, JWT_SECRET
    ├── .env.example             # PostgreSQL & SQLite sample configuration
    ├── prisma/
    │   ├── schema.prisma        # PostgreSQL Schema (for Cloud / Supabase)
    │   ├── schema.sqlite.prisma # SQLite Schema (used for local standalone execution)
    │   ├── dev.db               # Seeded SQLite database file
    │   └── seed.ts              # 30 Indian foods + comprehensive demo user history
    └── src/
        ├── index.ts             # Express server setup, CORS, route registry
        ├── config/db.ts         # Prisma client singleton
        ├── middleware/auth.ts   # JWT authentication & route protection
        ├── utils/calculations.ts# Scientific calculations (Mifflin-St Jeor, BMI, MET)
        ├── routes/              # 15 Modular REST API Routes
        │   ├── auth.routes.ts       # Register, Login, Me, Token refresh
        │   ├── user.routes.ts       # Profile CRUD, GDPR Data Export, Deletion
        │   ├── body.routes.ts       # Body measurements & BMI calculations
        │   ├── activity.routes.ts   # Daily activity logging & sync
        │   ├── workout.routes.ts    # Workouts, exercises, sets & reps
        │   ├── heartRate.routes.ts  # Resting & exercise heart rate logs
        │   ├── sleep.routes.ts      # Sleep duration & quality tracking
        │   ├── nutrition.routes.ts  # Food database & 5-meal daily logs
        │   ├── dietPlan.routes.ts   # Personalized meal recommendation engine
        │   ├── hydration.routes.ts  # Water logging & progress calculations
        │   ├── wellness.routes.ts   # Mood, energy, and stress journals
        │   ├── goals.routes.ts      # Goal progress, streaks, achievements
        │   ├── reports.routes.ts    # Aggregated weekly/monthly reports + CSV
        │   ├── dashboard.routes.ts  # Unified main dashboard summary API
        │   └── dataSource.routes.ts # Health Connect / Device CSV imports
        └── __tests__/
            └── nutricare.test.ts    # 10 automated unit & calculation tests
```

---

## 2. Order of Execution & How to Run Everything

To run the application from scratch in PowerShell at any time:

### Step 1: Set Execution Policy & Node Path
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
$env:Path = "C:\Program Files\nodejs;C:\Program Files (x86)\cloudflared;" + $env:Path
```

### Step 2: Start the Backend Server (Port 5000)
```powershell
cd C:\Users\MANEESH\.gemini\antigravity\scratch\nutricare\server
npx.cmd tsx src/index.ts
```
*Health Check:* `http://localhost:5000/api/health`

### Step 3: Start the Frontend App (Port 5173)
```powershell
cd C:\Users\MANEESH\.gemini\antigravity\scratch\nutricare\client
npx.cmd vite --host
```
*Local Browser:* `http://localhost:5173/`  
*Local Wi-Fi:* `http://172.20.254.251:5173/`

### Step 4: Shareable Cloudflare Mobile Tunnel
```powershell
& "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:5173
```
*Live Public URL:* `https://thru-lows-studied-readings.trycloudflare.com`

---

## 3. The 10 Core Application Modules

| # | Module | Core Functionality |
|---|--------|-------------------|
| 1 | **Main Dashboard** | Daily overview: calories in/out, macro progress bar, water wheel, step count, sleep duration, mood indicator |
| 2 | **Body Monitoring** | Historical weight logging, auto-calculated BMI screening, body fat %, waist/hip measurements, target weight line charts |
| 3 | **Activity Tracking** | Steps, distance (km), active minutes, MET-based estimated calorie burn for 12 activities (Walking, Running, Cycling, etc.) |
| 4 | **Nutrition & Diet** | 30 verified Indian foods (Idli, Dosa, Chapati, Dal, Ragi Mudde, Paneer, etc.) across 5 meals: Breakfast, Morning Snack, Lunch, Evening Snack, Dinner |
| 5 | **Exercise & Workouts** | Strength & cardio tracking with exercise sets, repetitions, weights, rest intervals, and total tonnage |
| 6 | **Sleep Monitoring** | Bedtime, wake time, computed hours slept, sleep quality score (1-5), consistency trend graph |
| 7 | **Hydration Tracker** | Daily target (configurable), +250ml / +500ml quick-add buttons, visual circular progress ring |
| 8 | **Health Reports** | 7-day and 30-day aggregated analytics, adherence rates, one-click CSV data export |
| 9 | **Goals & Streaks** | Active streaks for steps, workouts, and hydration; bronze/silver/gold achievement badges |
| 10| **Profile & Settings**| Calorie target recalculation (Mifflin-St Jeor formula), metric/imperial unit toggle, data privacy export, account deletion |

---

## 4. REST API Endpoint Reference

| Route Category | Method & Path | Description |
|----------------|---------------|-------------|
| **System** | `GET /api/health` | Service uptime and status check |
| **Auth** | `POST /api/auth/register` | Register new user account with hashed password |
| **Auth** | `POST /api/auth/login` | Login and receive signed JWT token |
| **Auth** | `GET /api/auth/me` | Fetch authenticated user context |
| **User** | `GET /api/user/profile` | Retrieve user health profile & calorie targets |
| **User** | `PUT /api/user/profile` | Update biometric parameters & fitness goals |
| **User** | `GET /api/user/export-data`| Export all stored health data as structured JSON |
| **User** | `DELETE /api/user/account`| Complete GDPR-compliant user account deletion |
| **Dashboard** | `GET /api/dashboard/today` | Unified daily metrics payload for dashboard view |
| **Body** | `GET /api/body/history` | Historical body measurements |
| **Body** | `POST /api/body` | Record new weight and body measurements |
| **Activity** | `GET /api/activity/history` | Historical movement & workout activities |
| **Activity** | `POST /api/activity` | Log exercise with duration, distance, intensity |
| **Nutrition** | `GET /api/nutrition/foods` | Search Indian food database |
| **Nutrition** | `GET /api/nutrition/today` | Fetch today's logged meals and macro totals |
| **Nutrition** | `POST /api/nutrition/meals` | Log food items to a specific meal |
| **Diet Plan** | `GET /api/diet-plan` | Retrieve current personalized meal plan |
| **Diet Plan** | `POST /api/diet-plan/generate` | Generate algorithm-based personalized meal plan |
| **Hydration** | `GET /api/hydration/today` | Today's water intake status vs goal |
| **Hydration** | `POST /api/hydration` | Log water consumption in milliliters |
| **Sleep** | `GET /api/sleep/history` | Sleep duration & quality logs |
| **Sleep** | `POST /api/sleep` | Record bedtime, wake time, and quality score |
| **Reports** | `GET /api/reports/weekly` | 7-day health trend analytics |
| **Reports** | `GET /api/reports/export-csv` | Download full history as standard CSV file |
| **Goals** | `GET /api/goals` | User target goals and active streaks |

---

## 5. Ready-to-Use Demo Account
* **URL:** [https://thru-lows-studied-readings.trycloudflare.com](https://thru-lows-studied-readings.trycloudflare.com)
* **Email:** `demo@nutricare.com`
* **Password:** `Password123!`
*(Pre-loaded with 30 days of body metrics, meal logs, sleep logs, workouts, water entries, and active streaks)*
