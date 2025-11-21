import React, { useEffect, useState } from 'react';
import { useSound } from '@/hooks/useSound';
import PomodoroSettings from './PomodoroSettings';

const PomodoroTimer: React.FC = () => {
  // Configuración del temporizador
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [pokemonBackground, setPokemonBackground] = useState('');

  // Cargar un Pokémon aleatorio al inicio
  useEffect(() => {
    const fetchRandomPokemon = async () => {
      try {
        const randomId = Math.floor(Math.random() * 151) + 1; // Primera generación
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        const data = await response.json();
        setPokemonBackground(data.sprites.other['official-artwork'].front_default);
      } catch (error) {
        console.error('Error fetching Pokemon:', error);
        setPokemonBackground('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png');
      }
    };

    fetchRandomPokemon();
  }, []);

  // Efectos de sonido
  const playStartSound = useSound('/sounds/start.mp3');
  const playCompleteSound = useSound('/sounds/complete.mp3');
  const playBreakSound = useSound('/sounds/break.mp3');

  // Actualizar el tiempo restante cuando cambia la configuración
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
    }
  }, [workMinutes, breakMinutes, mode, isActive]);

  // Efecto principal del temporizador
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      if (timeLeft === (mode === 'work' ? workMinutes * 60 : breakMinutes * 60)) {
        playStartSound?.();
      }
      
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(interval!);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (mode === 'work') {
        playCompleteSound?.();
        setMode('break');
        setTimeLeft(breakMinutes * 60);
        setSessionsCompleted(prev => prev + 1);
        setIsActive(false);
      } else {
        playBreakSound?.();
        setMode('work');
        setTimeLeft(workMinutes * 60);
        setIsActive(false);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, workMinutes, breakMinutes, playStartSound, playCompleteSound, playBreakSound]);

  const toggleTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveSettings = (newWorkMinutes: number, newBreakMinutes: number) => {
    setWorkMinutes(newWorkMinutes);
    setBreakMinutes(newBreakMinutes);
    setTimeLeft(mode === 'work' ? newWorkMinutes * 60 : newBreakMinutes * 60);
    setIsActive(false);
  };

  return (
    <div className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
      {/* Fondo con Pokémon */}
      {pokemonBackground && (
        <div 
          className="absolute inset-0 -z-10 opacity-20"
          style={{
            backgroundImage: `url('${pokemonBackground}')`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.3))'
          }}
        />
      )}

      {/* Contenido principal */}
      <div className="relative z-10">
        {/* Botón de configuración */}
        <div className="absolute top-4 right-4">
          <PomodoroSettings
            workMinutes={workMinutes}
            breakMinutes={breakMinutes}
            onSave={handleSaveSettings}
          />
        </div>

        {/* Temporizador */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            {mode === 'work' ? '⏱️ Tiempo de Trabajo' : '☕ Hora de Descanso'}
          </h2>
          
          <div className={`text-7xl font-mono font-bold my-6 ${
            mode === 'work' ? 'text-red-500' : 'text-green-500'
          }`}>
            {formatTime(timeLeft)}
          </div>
          
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={toggleTimer}
              className={`px-8 py-3 rounded-xl text-white font-semibold text-lg ${
                isActive 
                  ? 'bg-yellow-500 hover:bg-yellow-600' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
              } transition-all transform hover:scale-105 shadow-lg`}
            >
              {isActive ? '⏸️ Pausar' : '▶️ Comenzar'}
            </button>
            <button
              onClick={resetTimer}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              🔄 Reiniciar
            </button>
          </div>

          {/* Barra de progreso */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  mode === 'work' 
                    ? 'bg-gradient-to-r from-red-400 to-red-600' 
                    : 'bg-gradient-to-r from-green-400 to-green-600'
                }`}
                style={{
                  width: `${(timeLeft / (mode === 'work' ? workMinutes * 60 : breakMinutes * 60)) * 100}%`,
                  transition: 'width 1s linear'
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-300">
              <span className="flex items-center">
                {mode === 'work' ? '⏳ Trabajando...' : '☕ Descansando...'}
              </span>
              <span className="font-medium">
                Sesión {sessionsCompleted + 1}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;