import React from 'react';

export const GiftIllustration: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00A3E0" />
          <stop offset="100%" stopColor="#002F6C" />
        </linearGradient>
        <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFD100" />
          <stop offset="100%" stopColor="#FFB81C" />
        </linearGradient>
      </defs>
      {/* Sombra base */}
      <ellipse cx="60" cy="108" rx="42" ry="7" fill="#000000" fillOpacity="0.12" />
      {/* Caja del regalo */}
      <rect x="24" y="50" width="72" height="52" rx="10" fill="url(#boxGrad)" />
      {/* Tapa del regalo */}
      <rect x="18" y="38" width="84" height="16" rx="6" fill="#00A3E0" />
      {/* Cinta vertical */}
      <rect x="52" y="38" width="16" height="64" fill="url(#ribbonGrad)" />
      {/* Cinta horizontal tapa */}
      <rect x="18" y="44" width="84" height="4" fill="url(#ribbonGrad)" />
      {/* Moño lazo izquierdo */}
      <path
        d="M60 38 C45 22, 25 24, 40 38 Z"
        fill="url(#ribbonGrad)"
        stroke="#E69500"
        strokeWidth="1.5"
      />
      {/* Moño lazo derecho */}
      <path
        d="M60 38 C75 22, 95 24, 80 38 Z"
        fill="url(#ribbonGrad)"
        stroke="#E69500"
        strokeWidth="1.5"
      />
      {/* Centro del lazo */}
      <circle cx="60" cy="38" r="6" fill="#FF8D00" />
      {/* Brillo destello */}
      <circle cx="36" cy="62" r="3" fill="#FFFFFF" fillOpacity="0.6" />
      <circle cx="82" cy="74" r="2.5" fill="#FFFFFF" fillOpacity="0.6" />
    </svg>
  );
};

export const TrophyIllustration: React.FC<{ className?: string }> = ({ className = 'w-28 h-28' }) => {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF066" />
          <stop offset="50%" stopColor="#FFB81C" />
          <stop offset="100%" stopColor="#E68A00" />
        </linearGradient>
      </defs>
      {/* Destellos de fondo */}
      <circle cx="60" cy="50" r="44" fill="#FFB81C" fillOpacity="0.15" />
      {/* Sombra base */}
      <ellipse cx="60" cy="110" rx="36" ry="6" fill="#000000" fillOpacity="0.1" />
      {/* Base pedestal */}
      <rect x="42" y="94" width="36" height="14" rx="4" fill="#1E293B" />
      <rect x="48" y="86" width="24" height="10" rx="2" fill="#334155" />
      {/* Tallo del trofeo */}
      <path d="M54 68 H66 V86 H54 Z" fill="url(#goldGrad)" />
      {/* Copa */}
      <path
        d="M32 24 H88 C88 56 78 68 60 68 C42 68 32 56 32 24 Z"
        fill="url(#goldGrad)"
        stroke="#B45309"
        strokeWidth="1.5"
      />
      {/* Asas */}
      <path
        d="M32 30 C16 30 16 52 36 54"
        stroke="url(#goldGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M88 30 C104 30 104 52 84 54"
        stroke="url(#goldGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Estrella central grabada */}
      <path
        d="M60 36 L62.5 43.5 L70 43.5 L64 48 L66 55 L60 50.5 L54 55 L56 48 L50 43.5 L57.5 43.5 Z"
        fill="#FFFFFF"
        fillOpacity="0.9"
      />
    </svg>
  );
};
