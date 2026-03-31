import React, { useEffect, useState } from 'react';
import { usePokemon } from '@/context/PokemonContext';
import { motion } from 'framer-motion';

const TYPE_COLORS: Record<string, { from: string; to: string; glow: string }> = {
  electric: { from: '#F59E0B', to: '#D97706', glow: 'rgba(245,158,11,0.5)'  },
  fire:     { from: '#EF4444', to: '#B91C1C', glow: 'rgba(239,68,68,0.5)'   },
  water:    { from: '#3B82F6', to: '#1D4ED8', glow: 'rgba(59,130,246,0.5)'  },
  grass:    { from: '#10B981', to: '#047857', glow: 'rgba(16,185,129,0.5)'  },
  psychic:  { from: '#EC4899', to: '#BE185D', glow: 'rgba(236,72,153,0.5)'  },
  ghost:    { from: '#7C3AED', to: '#4C1D95', glow: 'rgba(124,58,237,0.5)'  },
  dragon:   { from: '#6366F1', to: '#3730A3', glow: 'rgba(99,102,241,0.5)'  },
  ice:      { from: '#67E8F9', to: '#0891B2', glow: 'rgba(103,232,249,0.5)' },
  default:  { from: '#9CA3AF', to: '#4B5563', glow: 'rgba(156,163,175,0.5)' },
};

const MOODS = [
  { key: 'idle',    label: 'Descanso', emoji: '😴' },
  { key: 'happy',   label: 'Feliz',    emoji: '😄' },
  { key: 'working', label: 'Foco',     emoji: '💪' },
  { key: 'tired',   label: 'Cansado',  emoji: '😓' },
] as const;

type MoodKey = typeof MOODS[number]['key'];

const getMoodAnim = (mood: string) => {
  if (mood === 'happy')    return { rotate: [0, -12, 12, -6, 0], transition: { duration: 1, repeat: Infinity } };
  if (mood === 'working')  return { y: [0, -10, 0], transition: { duration: 0.45, repeat: Infinity } };
  if (mood === 'tired')    return { scale: [1, 1.04, 1], rotate: [0, 3, -3, 0], transition: { duration: 2, repeat: Infinity } };
  if (mood === 'sleeping') return { rotate: [0, 6, -6, 0], transition: { duration: 2.5, repeat: Infinity } };
  return { y: [0, -6, 0], transition: { duration: 2.5, repeat: Infinity } };
};

const PokemonCompanion: React.FC = () => {
  const { companion, updateMood } = usePokemon();
  const [spriteUrl, setSpriteUrl] = useState('');
  const colors = TYPE_COLORS[companion.type] ?? TYPE_COLORS.default;
  const xpPct = Math.min((companion.experience / (companion.level * 100)) * 100, 100);

  useEffect(() => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${companion.pokemonId}`)
      .then(r => r.json())
      .then(d => setSpriteUrl(d.sprites.other['official-artwork'].front_default))
      .catch(() => setSpriteUrl(
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
      ));
  }, [companion.pokemonId]);

  return (
    <div className="glass-strong rounded-3xl p-5 relative overflow-hidden flex flex-col items-center">
      <div className="absolute top-0 left-6 right-6 h-px"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)' }} />

      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 25%, ${colors.glow.replace('0.5', '0.10')} 0%, transparent 65%)` }} />

      <div className="absolute top-4 right-4">
        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: `linear-gradient(135deg,${colors.from},${colors.to})`, boxShadow: `0 2px 10px ${colors.glow}` }}>
          Nv.{companion.level}
        </span>
      </div>

      <div className="w-24 h-24 flex items-center justify-center mb-2 mt-1">
        {spriteUrl ? (
          <motion.img src={spriteUrl} alt={companion.name} className="w-20 h-20 object-contain"
            animate={getMoodAnim(companion.mood)}
            style={{ filter: `drop-shadow(0 4px 16px ${colors.glow})` }} />
        ) : (
          <motion.div className="text-5xl" animate={getMoodAnim(companion.mood)}>🐾</motion.div>
        )}
      </div>

      <h3 className="text-base font-bold mb-0.5">{companion.name}</h3>
      <span className="text-xs px-2.5 py-0.5 rounded-full mb-4 font-medium capitalize"
        style={{ background: `${colors.from}22`, color: colors.from, border: `1px solid ${colors.from}35` }}>
        {companion.type}
      </span>

      <div className="w-full mb-4">
        <div className="flex justify-between text-xs text-white/35 mb-1.5">
          <span>EXP</span><span>{companion.experience} / {companion.level * 100}</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg,${colors.from},${colors.to})`, boxShadow: `0 0 8px ${colors.glow}` }}
            initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 w-full">
        {MOODS.map(({ key, label, emoji }) => (
          <motion.button key={key} onClick={() => updateMood(key as MoodKey)}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
            className={`py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all border ${
              companion.mood === key ? 'text-white border-white/18' : 'text-white/40 border-white/8 hover:text-white/65'}`}
            style={companion.mood === key ? {
              background: `linear-gradient(135deg,${colors.from}55,${colors.to}55)`,
              boxShadow: `0 2px 10px ${colors.glow}`
            } : { background: 'rgba(255,255,255,0.04)' }}>
            {emoji} {label}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default PokemonCompanion;
