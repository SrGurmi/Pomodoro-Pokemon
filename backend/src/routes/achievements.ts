import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const ACHIEVEMENTS = [
  { id: 'first_task', title: 'Primera tarea', description: 'Completa tu primera tarea', icon: '✅' },
  { id: 'pomodoro_master', title: 'Maestro Pomodoro', description: 'Completa 10 sesiones pomodoro', icon: '🍅' },
  { id: 'early_bird', title: 'Madrugador', description: 'Completa una tarea antes de las 9am', icon: '🌅' },
  { id: 'task_master', title: 'Task Master', description: 'Completa 50 tareas', icon: '🏆' },
  { id: 'streak_3', title: 'Racha de 3 días', description: 'Usa la app 3 días seguidos', icon: '🔥' },
  { id: 'level_5', title: 'Entrenador Nivel 5', description: 'Tu Pokémon llegó al nivel 5', icon: '⭐' },
  { id: 'level_10', title: 'Entrenador Experto', description: 'Tu Pokémon llegó al nivel 10', icon: '🌟' },
];

// GET /api/achievements
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const unlocked = await prisma.userAchievement.findMany({
      where: { userId: req.userId },
    });

    const unlockedIds = new Set(unlocked.map((a) => a.achievementId));

    const achievements = ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: unlockedIds.has(a.id),
      unlockedAt: unlocked.find((u) => u.achievementId === a.id)?.unlockedAt || null,
    }));

    res.json({ achievements });
  } catch (err) {
    console.error('Get achievements error:', err);
    res.status(500).json({ error: 'Error al obtener logros' });
  }
});

// POST /api/achievements/:id/unlock
router.post('/:id/unlock', async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string;

  const achievement = ACHIEVEMENTS.find((a) => a.id === id);
  if (!achievement) {
    res.status(404).json({ error: 'Logro no encontrado' });
    return;
  }

  try {
    const existing = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId: req.userId!, achievementId: id } },
    });

    if (existing) {
      res.json({ achievement: { ...achievement, unlocked: true, unlockedAt: existing.unlockedAt }, alreadyUnlocked: true });
      return;
    }

    const unlocked = await prisma.userAchievement.create({
      data: { userId: req.userId!, achievementId: id },
    });

    res.status(201).json({
      achievement: { ...achievement, unlocked: true, unlockedAt: unlocked.unlockedAt },
      alreadyUnlocked: false,
    });
  } catch (err) {
    console.error('Unlock achievement error:', err);
    res.status(500).json({ error: 'Error al desbloquear logro' });
  }
});

export default router;
