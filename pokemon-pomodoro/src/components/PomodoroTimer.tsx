import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/hooks/useSound';
import PomodoroSettings from './PomodoroSettings';

const RADIUS = 88;
const CIRC = 2 * Math.PI * RADIUS;

const PomodoroTimer: React.FC = () => {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [pokemonSprite, setPokemonSprite] = useState('');
  const [pokemonName, setPokemonName] = useState('');

  const playStart = useSound('/sounds/start.mp3');
  const playComplete = useSound('/sounds/complete.mp3');
  const playBreak = useSound('/sounds/break.mp3');

  useEffect(() => {
    const id = Math.floor(Math.random() * 151) + 1;
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      .then(r => r.json())
      .then(d => {
        setPokemonSprite(d.sprites.other['official-artwork'].front_default);
        setPokemonName(d.name.charAt(0).toUpperCase() + d.name.slice(1));
      })
      .catch(() => {
        setPokemonSprite('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png');
        setPokemonName('Pikachu');
      });
  }, []);

  useEffect(() => {
    if (!isActive) setTimeLeft(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
  }, [workMinutes, breakMinutes, mode, isActive]);

  useEffect(() => {
    let iv: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      iv = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      if (mode === 'work') {
        playComplete?.();
        setMode('break'); setTimeLeft(breakMinutes * 60);
        setSessionsCompleted(s => s + 1); setIsActive(false);
      } else {
        playBreak?.();
        setMode('work'); setTimeLeft(workMinutes * 60); setIsActive(false);
      }
    }
    return () => { if (iv) clearInterval(iv); };
  }, [isActive, timeLeft, mode, workMinutes, breakMinutes, playComplete, playBreak]);

  const toggle = () => {
    if (!isActive) playStart?.();
    if (timeLeft === 0) setTimeLeft(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
    setIsActive(a => !a);
  };
  const reset = () => { setIsActive(false); setTimeLeft(mode === 'work' ? workMinutes * 60 : breakMinutes * 60); };
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const total = mode === 'work' ? workMinutes * 60 : breakMinutes * 60;
  const offset = CIRC * (1 - timeLeft / total);
  const isWork = mode === 'work';

  return (
    <div className="glass-strong rounded-3xl p-6 relative overflow-hidden">
      <div className="absolute top-0 left-8 right-8 h-px"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)' }} />

      <div className="absolute top-4 right-4 z-20">
        <PomodoroSettings workMinutes={workMinutes} breakMinutes={breakMinutes}
          onSave={(w, b) => { setWorkMinutes(w); setBreakMinutes(b);
            setTimeLeft(isWork ? w * 60 : b * 60); setIsActive(false); }} />
      </div>

      {/* Mode badge */}
      <div className="flex justify-center mb-4">
        <AnimatePresence mode="wait">
          <motion.span key={mode}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className={`text-xs font-semibold tracking-widest px-3 py-1 rounded-full border ${
              isWork ? 'bg-red-500/15 text-red-300 border-red-500/30'
                     : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'}`}>
            {isWork ? '⚡ ENFOQUE' : '☕ DESCANSO'}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Ring timer */}
      <div className="flex justify-center mb-5">
        <div className="relative w-[220px] h-[220px]">
          <svg width="220" height="220" viewBox="0 0 220 220"
            className={isActive ? (isWork ? 'animate-ring-glow' : 'animate-ring-glow-green') : ''}>
            <circle cx="110" cy="110" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <circle cx="110" cy="110" r={RADIUS} fill="none"
              stroke={isWork ? '#EF4444' : '#10B981'} strokeWidth="10"
              strokeDasharray={CIRC} strokeDashoffset={offset} strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '110px 110px', transition: 'stroke-dashoffset 1s linear' }} />
            {/* Pokeball divider */}
            <line x1="22" y1="110" x2="198" y2="110" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
            <circle cx="110" cy="110" r="18" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
            <circle cx="110" cy="110" r="6" fill={isWork ? '#EF4444' : '#10B981'} />
          </svg>

          {/* Pokemon sprite */}
          {pokemonSprite && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginBottom: 32 }}>
              <motion.img src={pokemonSprite} alt={pokemonName}
                className={`w-[72px] h-[72px] object-contain ${isActive ? 'animate-bounce-gentle' : ''}`}
                style={{ filter: `drop-shadow(0 2px 12px ${isWork ? 'rgba(239,68,68,0.6)' : 'rgba(16,185,129,0.6)'})` }}
                initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }} />
            </div>
          )}

          {/* Time */}
          <div className="absolute bottom-5 left-0 right-0 text-center">
            <span className="font-mono font-bold tracking-tight"
              style={{ fontSize: 34, textShadow: `0 0 18px ${isWork ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.5)'}` }}>
              {fmt(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3 mb-4">
        <motion.button onClick={toggle} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="px-8 py-2.5 rounded-2xl font-semibold text-sm text-white cursor-pointer"
          style={{
            background: isActive ? 'linear-gradient(135deg,#F59E0B,#D97706)'
              : isWork ? 'linear-gradient(135deg,#EF4444,#B91C1C)' : 'linear-gradient(135deg,#10B981,#059669)',
            boxShadow: isActive ? '0 4px 18px rgba(245,158,11,0.35)'
              : isWork ? '0 4px 18px rgba(239,68,68,0.35)' : '0 4px 18px rgba(16,185,129,0.35)',
          }}>
          {isActive ? '⏸ Pausar' : '▶ Comenzar'}
        </motion.button>
        <motion.button onClick={reset} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="px-5 py-2.5 glass rounded-2xl text-white/55 hover:text-white text-sm font-medium cursor-pointer transition-colors">
          ↺ Reset
        </motion.button>
      </div>

      {/* Session dots */}
      <div className="flex justify-center items-center gap-2">
        <span className="text-white/30 text-xs">Sesiones</span>
        <div className="flex gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div key={i} animate={i < sessionsCompleted % 4 ? { scale: [1, 1.4, 1] } : {}}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                i < sessionsCompleted % 4 ? 'bg-red-400' : 'bg-white/12'}`} />
          ))}
        </div>
        <span className="text-white/35 text-xs font-mono">{sessionsCompleted}</span>
      </div>
    </div>
  );
};

export default PomodoroTimer;
