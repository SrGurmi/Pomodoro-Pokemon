import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma';

import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import sessionRoutes from './routes/sessions';
import pokemonRoutes from './routes/pokemon';
import achievementRoutes from './routes/achievements';
import statsRoutes from './routes/stats';
import settingsRoutes from './routes/settings';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Initialize DB tables (needed for ephemeral /tmp SQLite on serverless)
const dbReady: Promise<void> = (async () => {
  try {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "username" TEXT NOT NULL UNIQUE,
      "passwordHash" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Task" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "completed" BOOLEAN NOT NULL DEFAULT false,
      "pomodorosCompleted" INTEGER NOT NULL DEFAULT 0,
      "estimatedPomodoros" INTEGER NOT NULL DEFAULT 1,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
    )`);
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "PomodoroSession" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "taskId" TEXT,
      "duration" INTEGER NOT NULL DEFAULT 0,
      "type" TEXT NOT NULL DEFAULT 'work',
      "completed" BOOLEAN NOT NULL DEFAULT false,
      "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "endedAt" DATETIME,
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
    )`);
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "PokemonState" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL UNIQUE,
      "pokemonId" INTEGER NOT NULL DEFAULT 25,
      "name" TEXT NOT NULL DEFAULT 'pikachu',
      "level" INTEGER NOT NULL DEFAULT 1,
      "xp" INTEGER NOT NULL DEFAULT 0,
      "type" TEXT NOT NULL DEFAULT 'electric',
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
    )`);
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "UserAchievement" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "achievementId" TEXT NOT NULL,
      "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
      UNIQUE ("userId", "achievementId")
    )`);
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "UserSettings" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL UNIQUE,
      "workDuration" INTEGER NOT NULL DEFAULT 25,
      "breakDuration" INTEGER NOT NULL DEFAULT 5,
      "longBreak" INTEGER NOT NULL DEFAULT 15,
      "theme" TEXT NOT NULL DEFAULT 'dark',
      "pokemonType" TEXT NOT NULL DEFAULT 'electric',
      "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
    )`);
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "RefreshToken" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "expiresAt" DATETIME NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
    )`);
  } catch (err) {
    console.error('DB init error:', err);
  }
})();

// Wait for DB before processing any request
app.use((_req: Request, _res: Response, next: NextFunction) => {
  dbReady.then(next).catch(next);
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/pokemon', pokemonRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/settings', settingsRoutes);

export default app;
