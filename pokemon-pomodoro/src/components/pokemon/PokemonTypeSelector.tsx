import React from 'react';
import { PokemonType } from '@/context/ThemeContext';
import { useTheme } from '@/context/ThemeContext';

const PokemonTypeSelector: React.FC = () => {
  const { pokemonType, setPokemonType, getTypeColors } = useTheme();

  const pokemonTypes: PokemonType[] = [
    'normal', 'fire', 'water', 'electric', 'grass',
    'ice', 'fighting', 'poison', 'ground', 'flying',
    'psychic', 'bug', 'rock', 'ghost', 'dragon',
    'dark', 'steel', 'fairy'
  ];

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">Elige tu tipo de Pokémon</h3>
      <div className="flex flex-wrap gap-2">
        {pokemonTypes.map((type) => {
          const colors = getTypeColors(type);
          const isActive = pokemonType === type;
          
          return (
            <button
              key={type}
              onClick={() => setPokemonType(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${colors.bg} ${colors.text} ${colors.border} border ${isActive ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
              title={type.charAt(0).toUpperCase() + type.slice(1)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PokemonTypeSelector;