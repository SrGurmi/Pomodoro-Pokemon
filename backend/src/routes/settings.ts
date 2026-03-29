import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// GET /api/settings
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    let settings = await prisma.userSettings.findUnique({ where: { userId: req.userId } });

    if (!settings) {
      settings = await prisma.userSettings.create({ data: { userId: req.userId! } });
    }

    res.json({ settings });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

// PATCH /api/settings
router.patch('/', async (req: AuthRequest, res: Response) => {
  const { workDuration, breakDuration, longBreak, theme, pokemonType, soundEnabled } = req.body;

  try {
    const settings = await prisma.userSettings.upsert({
      where: { userId: req.userId },
      create: {
        userId: req.userId!,
        ...(workDuration !== undefined && { workDuration }),
        ...(breakDuration !== undefined && { breakDuration }),
        ...(longBreak !== undefined && { longBreak }),
        ...(theme !== undefined && { theme }),
        ...(pokemonType !== undefined && { pokemonType }),
        ...(soundEnabled !== undefined && { soundEnabled }),
      },
      update: {
        ...(workDuration !== undefined && { workDuration }),
        ...(breakDuration !== undefined && { breakDuration }),
        ...(longBreak !== undefined && { longBreak }),
        ...(theme !== undefined && { theme }),
        ...(pokemonType !== undefined && { pokemonType }),
        ...(soundEnabled !== undefined && { soundEnabled }),
      },
    });

    res.json({ settings });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

export default router;
