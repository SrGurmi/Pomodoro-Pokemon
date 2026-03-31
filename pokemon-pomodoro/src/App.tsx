import React, { useState } from 'react';
import PomodoroTimer from './components/PomodoroTimer';
import { Toaster } from './components/ui/toaster';
import { PokemonProvider } from './context/PokemonContext';
import { TaskProvider } from './context/TaskContext';
import { ThemeProvider } from './context/ThemeContext';
import { MusicProvider } from './context/MusicContext';
import { AchievementProvider } from './context/AchievementContext';
import { SpotifyProvider } from './context/SpotifyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import TaskList from './components/TaskList';
import PokemonCompanion from './components/pokemon/PokemonCompanion';
import AchievementToast from './components/pokemon/AchievementToast';
import { AuthScreen } from './components/auth/AuthScreen';
import { CosmicBackground } from './components/ui/CosmicBackground';
import { Masterball } from './components/ui/PokeBalls';
import { motion } from 'framer-motion';

function AppContent() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <CosmicBackground />
        <motion.div className="text-center z-10"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
            <Masterball size={56} />
          </motion.div>
          <p className="text-white/40 text-sm mt-4 tracking-widest">CARGANDO...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) return <AuthScreen />;

  return (
    <ThemeProvider>
      <PokemonProvider>
        <TaskProvider>
          <MusicProvider>
            <SpotifyProvider>
              <AchievementProvider>
                <div className="min-h-screen relative">
                  <CosmicBackground />

                  {/* Header */}
                  <header className="relative z-10 glass border-b border-white/8 px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Masterball size={28} />
                      <span className="font-bold text-lg tracking-tight">PokéTimer</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/40 text-xs hidden sm:block">
                        Entrenador <span className="text-white/80 font-medium">{user?.username}</span>
                      </span>
                      <motion.button onClick={logout} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        className="text-xs px-3 py-1.5 glass rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer">
                        Salir
                      </motion.button>
                    </div>
                  </header>

                  {/* Main content */}
                  <main className="relative z-10 container mx-auto px-4 py-6 max-w-3xl">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}>
                      <PomodoroTimer />
                    </motion.div>

                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}>
                        <PokemonCompanion />
                      </motion.div>
                      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}>
                        <TaskList />
                      </motion.div>
                    </div>
                  </main>

                  <Toaster />
                  <AchievementToast
                    title={`¡Bienvenido, ${user?.username}!`}
                    description="Completa tareas para ganar XP y subir de nivel."
                    onClose={() => setShowWelcome(false)}
                    show={showWelcome}
                    type="achievement"
                  />
                </div>
              </AchievementProvider>
            </SpotifyProvider>
          </MusicProvider>
        </TaskProvider>
      </PokemonProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
