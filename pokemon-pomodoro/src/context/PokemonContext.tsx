
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PokemonType } from './ThemeContext';

type PokemonContextType = {
  companion: {
    name: string;
    type: PokemonType;
    level: number;
    experience: number;
    mood: 'idle' | 'happy' | 'working' | 'tired' | 'sleeping';
  };
  updateMood: (mood: 'idle' | 'happy' | 'working' | 'tired' | 'sleeping') => void;
  addExperience: (exp: number) => void;
  evolve: (newName: string, newType?: PokemonType) => void;
};

const PokemonContext = createContext<PokemonContextType | undefined>(undefined);

export const PokemonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [companion, setCompanion] = useState({
    name: 'Pikachu',
    type: 'electric' as PokemonType,
    level: 1,
    experience: 0,
    mood: 'idle' as const,
  });

  const updateMood = (mood: 'idle' | 'happy' | 'working' | 'tired' | 'sleeping') => {
    setCompanion(prev => ({ ...prev, mood }));
  };

  const addExperience = (exp: number) => {
    setCompanion(prev => {
      const newExp = prev.experience + exp;
      const expToNextLevel = prev.level * 100;
      
      if (newExp >= expToNextLevel) {
        return {
          ...prev,
          level: prev.level + 1,
          experience: newExp - expToNextLevel,
        };
      }
      
      return { ...prev, experience: newExp };
    });
  };

  const evolve = (newName: string, newType?: PokemonType) => {
    setCompanion(prev => ({
      ...prev,
      name: newName,
      type: newType || prev.type,
    }));
  };

  return (
    <PokemonContext.Provider value={{ companion, updateMood, addExperience, evolve }}>
      {children}
    </PokemonContext.Provider>
  );
};

export const usePokemon = () => {
  const context = useContext(PokemonContext);
  if (context === undefined) {
    throw new Error('usePokemon must be used within a PokemonProvider');
  }
  return context;
};