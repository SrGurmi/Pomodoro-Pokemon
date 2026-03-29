// src/App.tsx
import React from 'react';
import PomodoroTimer from './components/PomodoroTimer';
import { Toaster } from './components/ui/toaster';
import { PokemonProvider } from './context/PokemonContext';
import { TaskProvider } from './context/TaskContext';
import { ThemeProvider } from './context/ThemeContext';
import { MusicProvider } from './context/MusicContext';
import { AchievementProvider } from './context/AchievementContext';
import { SpotifyProvider } from './context/SpotifyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import MusicPlayer from './components/MusicPlayer';
import TaskList from './components/TaskList';
import PokemonCompanion from './components/pokemon/PokemonCompanion';
import PokemonTypeSelector from './components/pokemon/PokemonTypeSelector';
import AchievementToast from './components/pokemon/AchievementToast';
import { AuthScreen } from './components/auth/AuthScreen';

function AppContent() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-white text-center">
          <div className="text-5xl mb-4">🎮</div>
          <p className="text-lg opacity-70">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <ThemeProvider>
      <PokemonProvider>
        <TaskProvider>
          <MusicProvider>
            <SpotifyProvider>
              <AchievementProvider>
                <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-colors duration-200">
                  <header className="flex items-center justify-between px-6 py-3 border-b border-white/10">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
                      PokéTimer
                    </h1>
                    <div className="flex items-center gap-3">
                      <span className="text-sm opacity-60">
                        Hola, <span className="font-medium opacity-100">{user?.username}</span>
                      </span>
                      <button
                        onClick={logout}
                        className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        Salir
                      </button>
                    </div>
                  </header>

                  <main className="container mx-auto px-4 py-6">
                    <div className="max-w-2xl mx-auto">
                      <PomodoroTimer />
                      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PokemonCompanion />
                        <div className="space-y-6">
                          <MusicPlayer />
                          <TaskList />
                        </div>
                      </div>
                    </div>
                  </main>
                  <Toaster />
                  <AchievementToast
                    title={`¡Bienvenido de vuelta, ${user?.username}!`}
                    description="Comienza completando tareas para ganar experiencia."
                    onClose={() => {}}
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
