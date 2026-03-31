// Pokeball SVG components — pure SVG, no images needed

interface BallProps {
  size?: number;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Pokeball({ size = 60, opacity = 1, className = '', style }: BallProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className={className} style={{ opacity, ...style }}>
      <circle cx="30" cy="30" r="28" fill="rgba(0,0,0,0.6)" />
      <path d="M2 30 A28 28 0 0 1 58 30 Z" fill="#EF4444" />
      <path d="M2 30 A28 28 0 0 0 58 30 Z" fill="rgba(255,255,255,0.92)" />
      <rect x="2" y="27" width="56" height="6" fill="rgba(0,0,0,0.75)" />
      <circle cx="30" cy="30" r="8" fill="white" stroke="rgba(0,0,0,0.75)" strokeWidth="2.5" />
      <circle cx="30" cy="30" r="3.5" fill="rgba(220,220,220,0.6)" />
    </svg>
  );
}

export function GreatBall({ size = 60, opacity = 1, className = '', style }: BallProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className={className} style={{ opacity, ...style }}>
      <circle cx="30" cy="30" r="28" fill="rgba(0,0,0,0.6)" />
      <path d="M2 30 A28 28 0 0 1 58 30 Z" fill="#3B82F6" />
      <path d="M9 19 L22 30 L9 30 Z" fill="#EF4444" opacity="0.9" />
      <path d="M51 19 L38 30 L51 30 Z" fill="#EF4444" opacity="0.9" />
      <path d="M2 30 A28 28 0 0 0 58 30 Z" fill="rgba(255,255,255,0.88)" />
      <rect x="2" y="27" width="56" height="6" fill="rgba(0,0,0,0.75)" />
      <circle cx="30" cy="30" r="8" fill="white" stroke="rgba(0,0,0,0.75)" strokeWidth="2.5" />
      <circle cx="30" cy="30" r="3.5" fill="#BFDBFE" />
    </svg>
  );
}

export function UltraBall({ size = 60, opacity = 1, className = '', style }: BallProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className={className} style={{ opacity, ...style }}>
      <circle cx="30" cy="30" r="28" fill="rgba(0,0,0,0.6)" />
      <path d="M2 30 A28 28 0 0 1 58 30 Z" fill="#F59E0B" />
      <path d="M13 8 Q30 0 47 8 Q30 20 13 8 Z" fill="rgba(0,0,0,0.55)" />
      <path d="M2 30 A28 28 0 0 0 58 30 Z" fill="rgba(10,10,10,0.88)" />
      <rect x="2" y="27" width="56" height="6" fill="rgba(0,0,0,0.9)" />
      <circle cx="30" cy="30" r="8" fill="white" stroke="#F59E0B" strokeWidth="2.5" />
      <circle cx="30" cy="30" r="3.5" fill="#FEF3C7" />
    </svg>
  );
}

export function Masterball({ size = 60, opacity = 1, className = '', style }: BallProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className={className} style={{ opacity, ...style }}>
      <circle cx="30" cy="30" r="28" fill="rgba(0,0,0,0.6)" />
      <path d="M2 30 A28 28 0 0 1 58 30 Z" fill="#7C3AED" />
      <text x="30" y="25" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="serif">M</text>
      <circle cx="16" cy="17" r="3.5" fill="#F472B6" />
      <circle cx="44" cy="17" r="3.5" fill="#F472B6" />
      <path d="M2 30 A28 28 0 0 0 58 30 Z" fill="#4C1D95" />
      <rect x="2" y="27" width="56" height="6" fill="rgba(0,0,0,0.75)" />
      <circle cx="30" cy="30" r="8" fill="white" stroke="rgba(0,0,0,0.75)" strokeWidth="2.5" />
      <circle cx="30" cy="30" r="3.5" fill="#DDD6FE" />
    </svg>
  );
}
