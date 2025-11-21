// src/context/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

export type PokemonType = 
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' 
  | 'ice' | 'fighting' | 'poison' | 'ground' | 'flying'
  | 'psychic' | 'bug' | 'rock' | 'ghost' | 'dragon'
  | 'dark' | 'steel' | 'fairy' | 'default';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  pokemonType: PokemonType;
  setPokemonType: (type: PokemonType) => void;
  toggleTheme: () => void;
  getTypeColors: (type: PokemonType) => {
    bg: string;
    text: string;
    border: string;
    hover: string;
  };
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Colores para cada tipo de Pokémon
const typeColors = {
  normal: { bg: 'bg-gray-400', text: 'text-gray-800', border: 'border-gray-500', hover: 'hover:bg-gray-300' },
  fire: { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600', hover: 'hover:bg-red-400' },
  water: { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600', hover: 'hover:bg-blue-400' },
  electric: { bg: 'bg-yellow-400', text: 'text-gray-800', border: 'border-yellow-500', hover: 'hover:bg-yellow-300' },
  grass: { bg: 'bg-green-500', text: 'text-white', border: 'border-green-600', hover: 'hover:bg-green-400' },
  ice: { bg: 'bg-cyan-300', text: 'text-gray-800', border: 'border-cyan-400', hover: 'hover:bg-cyan-200' },
  fighting: { bg: 'bg-red-700', text: 'text-white', border: 'border-red-800', hover: 'hover:bg-red-600' },
  poison: { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600', hover: 'hover:bg-purple-400' },
  ground: { bg: 'bg-amber-600', text: 'text-white', border: 'border-amber-700', hover: 'hover:bg-amber-500' },
  flying: { bg: 'bg-indigo-300', text: 'text-gray-800', border: 'border-indigo-400', hover: 'hover:bg-indigo-200' },
  psychic: { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-600', hover: 'hover:bg-pink-400' },
  bug: { bg: 'bg-lime-500', text: 'text-white', border: 'border-lime-600', hover: 'hover:bg-lime-400' },
  rock: { bg: 'bg-amber-800', text: 'text-white', border: 'border-amber-900', hover: 'hover:bg-amber-700' },
  ghost: { bg: 'bg-indigo-800', text: 'text-white', border: 'border-indigo-900', hover: 'hover:bg-indigo-700' },
  dragon: { bg: 'bg-purple-700', text: 'text-white', border: 'border-purple-800', hover: 'hover:bg-purple-600' },
  dark: { bg: 'bg-gray-800', text: 'text-white', border: 'border-gray-900', hover: 'hover:bg-gray-700' },
  steel: { bg: 'bg-gray-400', text: 'text-gray-800', border: 'border-gray-500', hover: 'hover:bg-gray-300' },
  fairy: { bg: 'bg-pink-300', text: 'text-gray-800', border: 'border-pink-400', hover: 'hover:bg-pink-200' },
  default: { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600', hover: 'hover:bg-blue-400' },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [pokemonType, setPokemonType] = useState<PokemonType>('default');

  // Cargar preferencias guardadas
  useEffect(() => {
    // Tema claro/oscuro
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemPrefersDark) {
      setTheme('dark');
    }

    // Tipo de Pokémon guardado
    const savedPokemonType = localStorage.getItem('pokemonType') as PokemonType | null;
    if (savedPokemonType) {
      setPokemonType(savedPokemonType);
    }
  }, []);

  // Aplicar tema al documento
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // Actualizar el tipo de Pokémon
  const updatePokemonType = (type: PokemonType) => {
    setPokemonType(type);
    localStorage.setItem('pokemonType', type);
  };

  // Obtener colores para un tipo de Pokémon
  const getTypeColors = (type: PokemonType) => {
    return typeColors[type] || typeColors.default;
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        pokemonType,
        setPokemonType: updatePokemonType,
        toggleTheme, 
        getTypeColors 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
