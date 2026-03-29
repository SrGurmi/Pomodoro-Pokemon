import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// GET /api/tasks
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ tasks });
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

// POST /api/tasks
router.post('/', async (req: AuthRequest, res: Response) => {
  const { title, estimatedPomodoros } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    res.status(400).json({ error: 'El título es requerido' });
    return;
  }

  try {
    const task = await prisma.task.create({
      data: {
        userId: req.userId!,
        title: title.trim(),
        estimatedPomodoros: Number(estimatedPomodoros) || 1,
      },
    });
    res.status(201).json({ task });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Error al crear tarea' });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string;
  const { title, completed, pomodorosCompleted, estimatedPomodoros } = req.body;

  try {
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task || task.userId !== req.userId) {
      res.status(404).json({ error: 'Tarea no encontrada' });
      return;
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(completed !== undefined && { completed }),
        ...(pomodorosCompleted !== undefined && { pomodorosCompleted }),
        ...(estimatedPomodoros !== undefined && { estimatedPomodoros }),
      },
    });

    res.json({ task: updated });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string;

  try {
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task || task.userId !== req.userId) {
      res.status(404).json({ error: 'Tarea no encontrada' });
      return;
    }

    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Tarea eliminada' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
});

export default router;
