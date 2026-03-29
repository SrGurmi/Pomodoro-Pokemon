import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// POST /api/sessions/start
router.post('/start', async (req: AuthRequest, res: Response) => {
  const { taskId, type } = req.body;

  const validTypes = ['work', 'break', 'long_break'];
  if (type && !validTypes.includes(type)) {
    res.status(400).json({ error: 'Tipo de sesión inválido' });
    return;
  }

  try {
    const session = await prisma.pomodoroSession.create({
      data: {
        userId: req.userId!,
        taskId: taskId || null,
        type: type || 'work',
      },
    });
    res.status(201).json({ session });
  } catch (err) {
    console.error('Start session error:', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// PATCH /api/sessions/:id/complete
router.patch('/:id/complete', async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string;

  try {
    const session = await prisma.pomodoroSession.findUnique({ where: { id } });

    if (!session || session.userId !== req.userId) {
      res.status(404).json({ error: 'Sesión no encontrada' });
      return;
    }

    const endedAt = new Date();
    const duration = Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000);

    const updated = await prisma.pomodoroSession.update({
      where: { id },
      data: { completed: true, endedAt, duration },
    });

    res.json({ session: updated });
  } catch (err) {
    console.error('Complete session error:', err);
    res.status(500).json({ error: 'Error al completar sesión' });
  }
});

export default router;
