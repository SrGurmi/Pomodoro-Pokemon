import { useMemo } from 'react';
import { Pokeball, GreatBall, UltraBall, Masterball } from './PokeBalls';

const BALLS = [
  { Ball: Masterball, size: 80,  top: '7%',  left: '6%',   anim: 'pokeball-float-a', delay: '0s',    opacity: 0.18 },
  { Ball: Pokeball,   size: 55,  top: '12%', right: '8%',  anim: 'pokeball-float-b', delay: '-2.5s', opacity: 0.14 },
  { Ball: GreatBall,  size: 45,  top: '48%', left: '3%',   anim: 'pokeball-float-c', delay: '-1.2s', opacity: 0.13 },
  { Ball: UltraBall,  size: 65,  top: '55%', right: '4%',  anim: 'pokeball-float-a', delay: '-4s',   opacity: 0.16 },
  { Ball: Pokeball,   size: 38,  top: '78%', left: '14%',  anim: 'pokeball-float-b', delay: '-3s',   opacity: 0.12 },
  { Ball: Masterball, size: 32,  top: '82%', right: '18%', anim: 'pokeball-float-c', delay: '-5s',   opacity: 0.14 },
  { Ball: GreatBall,  size: 50,  top: '30%', right: '22%', anim: 'pokeball-float-a', delay: '-6s',   opacity: 0.10 },
  { Ball: UltraBall,  size: 28,  top: '65%', left: '28%',  anim: 'pokeball-float-b', delay: '-7s',   opacity: 0.12 },
];

export function CosmicBackground() {
  const stars = useMemo(() =>
    Array.from({ length: 35 }, (_, i) => ({
      id: i,
      size: (i * 13 % 3) + 1,
      top: (i * 37 % 100),
      left: (i * 53 % 100),
      delay: ((i * 0.4) % 3).toFixed(1),
      duration: ((i * 0.5 % 3) + 2).toFixed(1),
    })), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep space base */}
      <div className="absolute inset-0 bg-[#07071a]" />

      {/* Aurora blobs */}
      <div className="absolute animate-aurora" style={{ top: '15%', left: '20%', width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
        animationDelay: '0s' }} />
      <div className="absolute animate-aurora" style={{ bottom: '10%', right: '15%', width: 600, height: 400,
        background: 'radial-gradient(circle, rgba(220,38,38,0.13) 0%, transparent 70%)',
        animationDelay: '-2.5s' }} />
      <div className="absolute animate-aurora" style={{ top: '50%', left: '50%', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)',
        animationDelay: '-4s', transform: 'translate(-50%,-50%)' }} />

      {/* Stars */}
      {stars.map(s => (
        <div key={s.id} className="absolute rounded-full bg-white animate-twinkle"
          style={{ width: s.size, height: s.size, top: `${s.top}%`, left: `${s.left}%`,
            animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }} />
      ))}

      {/* Floating pokeballs */}
      {BALLS.map(({ Ball, size, top, left, right, anim, delay, opacity }, i) => (
        <div key={i} className={`absolute ${anim}`}
          style={{ top, left, right, animationDelay: delay }}>
          <Ball size={size} opacity={opacity} />
        </div>
      ))}
    </div>
  );
}
