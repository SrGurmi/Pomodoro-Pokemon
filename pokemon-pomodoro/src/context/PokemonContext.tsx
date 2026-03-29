import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { PokemonType } from './ThemeContext';
import { apiGet, apiPatch } from '../lib/api';

type PokemonMood = 'idle' | 'happy' | 'working' | 'tired' | 'sleeping';

type PokemonContextType = {
  companion: {
    name: string;
    type: PokemonType;
    level: number;
    experience: number;
    mood: PokemonMood;
    pokemonId: number;
  };
  updateMood: (mood: PokemonMood) => void;
  addExperience: (exp: number) => void;
  evolve: (newName: string, newType?: PokemonType) => void;
};

interface PokemonState {
  pokemonId: number;
  name: string;
  level: number;
  xp: number;
  type: string;
}

const PokemonContext = createContext<PokemonContextType | undefined>(undefined);

export const PokemonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [companion, setCompanion] = useState({
    name: 'Pikachu',
    type: 'electric' as PokemonType,
    level: 1,
    experience: 0,
    mood: 'idle' as PokemonMood,
    pokemonId: 25,
  });

  useEffect(() => {
    apiGet<{ pokemon: PokemonState }>('/api/pokemon')
      .then(data => {
        setCompanion(prev => ({
          ...prev,
          name: data.pokemon.name,
          type: data.pokemon.type as PokemonType,
          level: data.pokemon.level,
          experience: data.pokemon.xp,
          pokemonId: data.pokemon.pokemonId,
        }));
      })
      .catch(err => console.error('Failed to load pokemon:', err));
  }, []);

  const updateMood = useCallback((mood: PokemonMood) => {
    setCompanion(prev => ({ ...prev, mood }));
  }, []);

  const addExperience = useCallback((exp: number) => {
    apiPatch<{ pokemon: PokemonState; leveledUp: boolean }>('/api/pokemon', { xp: exp })
      .then(data => {
        setCompanion(prev => ({
          ...prev,
          level: data.pokemon.level,
          experience: data.pokemon.xp,
        }));
      })
      .catch(() => {
        // fallback to local calculation
        setCompanion(prev => {
          const newExp = prev.experience + exp;
          const expToNextLevel = prev.level * 100;
          if (newExp >= expToNextLevel) {
            return { ...prev, level: prev.level + 1, experience: newExp - expToNextLevel };
          }
          return { ...prev, experience: newExp };
        });
      });
  }, []);

  const evolve = useCallback((newName: string, newType?: PokemonType) => {
    setCompanion(prev => ({
      ...prev,
      name: newName,
      type: newType || prev.type,
    }));
    apiPatch('/api/pokemon', {
      name: newName,
      ...(newType && { type: newType }),
    }).catch(err => console.error('Failed to update pokemon:', err));
  }, []);

  return (
    <PokemonContext.Provider value={{ companion, updateMood, addExperience, evolve }}>
      {children}
    </PokemonContext.Provider>
  );
};

export const usePokemon = () => {
  const context = useContext(PokemonContext);
  if (!context) throw new Error('usePokemon must be used within a PokemonProvider');
  return context;
};
