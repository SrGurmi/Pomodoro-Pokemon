import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import sessionRoutes from './routes/sessions';
import pokemonRoutes from './routes/pokemon';
import achievementRoutes from './routes/achievements';
import statsRoutes from './routes/stats';
import settingsRoutes from './routes/settings';

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

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
