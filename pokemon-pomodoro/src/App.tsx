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
import MusicPlayer from './components/MusicPlayer';
import TaskList from './components/TaskList';
import PokemonCompanion from './components/pokemon/PokemonCompanion';
import PokemonTypeSelector from './components/pokemon/PokemonTypeSelector';
import AchievementToast from './components/pokemon/AchievementToast';

function App() {
  return (
    <ThemeProvider>
      <PokemonProvider>
        <TaskProvider>
          <MusicProvider>
            <SpotifyProvider>
              <AchievementProvider>
                <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-colors duration-200">
                  <main className="container mx-auto px-4 py-8">
                    <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
                      PokéTimer
                    </h1>
                    
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
                    title="¡Bienvenido a PokéTimer!"
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

export default App;