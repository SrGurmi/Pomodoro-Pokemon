import express from 'express';
import cors from 'cors';
import { createClient } from '@libsql/client';

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

// Create tables if they don't exist (works for both Turso and /tmp SQLite)
const dbUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:/tmp/dev.db';
const authToken = process.env.TURSO_AUTH_TOKEN;
const db = createClient({ url: dbUrl, ...(authToken ? { authToken } : {}) });

const dbReady = db.executeMultiple(`
  CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "username" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
    "updatedAt" TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "pomodorosCompleted" INTEGER NOT NULL DEFAULT 0,
    "estimatedPomodoros" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
    "updatedAt" TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS "PomodoroSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "taskId" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'work',
    "completed" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TEXT NOT NULL DEFAULT (datetime('now')),
    "endedAt" TEXT,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS "PokemonState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "pokemonId" INTEGER NOT NULL DEFAULT 25,
    "name" TEXT NOT NULL DEFAULT 'pikachu',
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'electric',
    "updatedAt" TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS "UserAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
    UNIQUE ("userId", "achievementId")
  );
  CREATE TABLE IF NOT EXISTS "UserSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "workDuration" INTEGER NOT NULL DEFAULT 25,
    "breakDuration" INTEGER NOT NULL DEFAULT 5,
    "longBreak" INTEGER NOT NULL DEFAULT 15,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "pokemonType" TEXT NOT NULL DEFAULT 'electric',
    "soundEnabled" INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS "RefreshToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expiresAt" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
  );
`).catch(err => console.error('DB init error:', err));

// Wait for tables before handling any request
app.use((_req, _res, next) => { dbReady.then(() => next()).catch(next); });

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', db: dbUrl.startsWith('libsql') ? 'turso' : 'sqlite', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/pokemon', pokemonRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/settings', settingsRoutes);

export default app;
