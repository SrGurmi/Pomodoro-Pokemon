// src/components/pokemon/PokemonCompanion.tsx
import React, { useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { usePokemon } from '@/context/PokemonContext';
import { motion } from 'framer-motion';

const PokemonCompanion: React.FC = () => {
  const { pokemonType, getTypeColors } = useTheme();
  const { companion, updateMood } = usePokemon();
  const colors = getTypeColors(companion.type);

  // Efectos de animación según el estado de ánimo
  useEffect(() => {
    // Aquí podrías agregar lógica para cambiar el estado de ánimo
    // basado en el estado del temporizador, tareas completadas, etc.
  }, []);

  const getMoodAnimation = () => {
    switch (companion.mood) {
      case 'happy':
        return {
          rotate: [0, -10, 10, -10, 0],
          transition: { duration: 1, repeat: Infinity }
        };
      case 'working':
        return {
          y: [0, -10, 0],
          transition: { duration: 0.5, repeat: Infinity }
        };
      case 'tired':
        return {
          scale: [1, 1.05, 1],
          transition: { duration: 1.5, repeat: Infinity }
        };
      case 'sleeping':
        return {
          rotate: [0, 5, -5, 0],
          transition: { duration: 2, repeat: Infinity }
        };
      default:
        return {
          y: [0, -5, 0],
          transition: { duration: 2, repeat: Infinity }
        };
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="relative">
        <motion.div
          className={`w-32 h-32 rounded-full ${colors.bg} flex items-center justify-center mb-4`}
          animate={getMoodAnimation()}
        >
          <span className="text-4xl">🐾</span>
        </motion.div>
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
          Nv. {companion.level}
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-bold">
          {companion.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Tipo: {companion.type.charAt(0).toUpperCase() + companion.type.slice(1)}
        </p>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
          <div 
            className="h-2 rounded-full bg-blue-500" 
            style={{ width: `${(companion.experience / (companion.level * 100)) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          EXP: {companion.experience}/{companion.level * 100}
        </p>
      </div>

      <div className="mt-4 flex gap-2 flex-wrap justify-center">
        <button 
          onClick={() => updateMood('happy')}
          className="px-3 py-1 bg-green-500 text-white rounded-md text-sm"
        >
          Feliz
        </button>
        <button 
          onClick={() => updateMood('working')}
          className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
        >
          Trabajando
        </button>
        <button 
          onClick={() => updateMood('tired')}
          className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm"
        >
          Cansado
        </button>
        <button 
          onClick={() => updateMood('sleeping')}
          className="px-3 py-1 bg-purple-500 text-white rounded-md text-sm"
        >
          Dormir
        </button>
      </div>
    </div>
  );
};

export default PokemonCompanion;