import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// GET /api/stats
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const [totalSessions, completedTasks, totalTimeResult] = await Promise.all([
      prisma.pomodoroSession.count({
        where: { userId: req.userId, completed: true, type: 'work' },
      }),
      prisma.task.count({
        where: { userId: req.userId, completed: true },
      }),
      prisma.pomodoroSession.aggregate({
        where: { userId: req.userId, completed: true, type: 'work' },
        _sum: { duration: true },
      }),
    ]);

    const totalSeconds = totalTimeResult._sum.duration || 0;

    res.json({
      stats: {
        totalSessions,
        completedTasks,
        totalMinutes: Math.floor(totalSeconds / 60),
        totalHours: parseFloat((totalSeconds / 3600).toFixed(1)),
      },
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// GET /api/stats/daily
router.get('/daily', async (req: AuthRequest, res: Response) => {
  try {
    const days = 7;
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [sessions, tasks] = await Promise.all([
        prisma.pomodoroSession.count({
          where: {
            userId: req.userId,
            completed: true,
            type: 'work',
            startedAt: { gte: date, lt: nextDate },
          },
        }),
        prisma.task.count({
          where: {
            userId: req.userId,
            completed: true,
            updatedAt: { gte: date, lt: nextDate },
          },
        }),
      ]);

      result.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        sessions,
        tasks,
      });
    }

    res.json({ daily: result });
  } catch (err) {
    console.error('Daily stats error:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas diarias' });
  }
});

// GET /api/stats/weekly
router.get('/weekly', async (req: AuthRequest, res: Response) => {
  try {
    const weeks = 4;
    const result = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - i * 7);
      endDate.setHours(23, 59, 59, 999);

      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      const [sessions, tasks] = await Promise.all([
        prisma.pomodoroSession.count({
          where: {
            userId: req.userId,
            completed: true,
            type: 'work',
            startedAt: { gte: startDate, lte: endDate },
          },
        }),
        prisma.task.count({
          where: {
            userId: req.userId,
            completed: true,
            updatedAt: { gte: startDate, lte: endDate },
          },
        }),
      ]);

      result.push({
        weekStart: startDate.toISOString().split('T')[0],
        weekEnd: endDate.toISOString().split('T')[0],
        label: `Sem ${weeks - i}`,
        sessions,
        tasks,
      });
    }

    res.json({ weekly: result });
  } catch (err) {
    console.error('Weekly stats error:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas semanales' });
  }
});

export default router;
