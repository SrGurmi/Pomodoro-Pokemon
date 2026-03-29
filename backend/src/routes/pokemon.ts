import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

function calculateLevel(xp: number): number {
  let level = 1;
  while (xp >= level * 100) {
    xp -= level * 100;
    level++;
  }
  return level;
}

// GET /api/pokemon
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const pokemon = await prisma.pokemonState.findUnique({
      where: { userId: req.userId },
    });

    if (!pokemon) {
      const created = await prisma.pokemonState.create({
        data: { userId: req.userId! },
      });
      res.json({ pokemon: created });
      return;
    }

    res.json({ pokemon });
  } catch (err) {
    console.error('Get pokemon error:', err);
    res.status(500).json({ error: 'Error al obtener Pokémon' });
  }
});

// PATCH /api/pokemon
router.patch('/', async (req: AuthRequest, res: Response) => {
  const { xp, pokemonId, name, type } = req.body;

  try {
    const current = await prisma.pokemonState.findUnique({ where: { userId: req.userId } });

    if (!current) {
      res.status(404).json({ error: 'Estado Pokémon no encontrado' });
      return;
    }

    const newXp = xp !== undefined ? current.xp + xp : current.xp;
    const newLevel = calculateLevel(newXp);

    const updated = await prisma.pokemonState.update({
      where: { userId: req.userId },
      data: {
        ...(xp !== undefined && { xp: newXp, level: newLevel }),
        ...(pokemonId !== undefined && { pokemonId }),
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
      },
    });

    res.json({ pokemon: updated, leveledUp: newLevel > current.level });
  } catch (err) {
    console.error('Update pokemon error:', err);
    res.status(500).json({ error: 'Error al actualizar Pokémon' });
  }
});

export default router;
