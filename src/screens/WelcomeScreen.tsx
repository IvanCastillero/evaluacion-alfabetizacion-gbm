import React from 'react';
import { Play } from 'lucide-react';
import { GiftIllustration } from '../components/Illustrations';
import { soundEffects } from '../lib/sound';

interface WelcomeScreenProps {
  isUnknownKiosk: boolean;
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ isUnknownKiosk, onStart }) => {
  const headline = isUnknownKiosk
    ? 'Juega 2 minutos y ayuda a tu comunidad'
    : 'Juega 2 minutos y gana un premio';

  const handleStart = () => {
    soundEffects.playTap();
    onStart();
  };

  return (
    <div className="flex-1 flex flex-col justify-between items-center text-center p-5 max-w-[420px] mx-auto w-full animate-in fade-in duration-300">
      {/* Zona superior: Título e Ilustración */}
      <div className="w-full flex-1 flex flex-col items-center justify-center pt-2 pb-4">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 mb-4">
          Comunidad GBM Panamá
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-6 px-2">
          {headline}
        </h1>

        <div className="relative my-2 transform hover:scale-105 transition-transform">
          <GiftIllustration className="w-36 h-36 drop-shadow-xl" />
        </div>

        <p className="text-slate-600 text-sm font-medium mt-4 max-w-xs">
          Responde 4 retos muy fáciles y rápidos con solo tocar la pantalla.
        </p>
      </div>

      {/* Zona inferior: Botón grande */}
      <div className="w-full pb-6 pt-2">
        <button
          type="button"
          onClick={handleStart}
          className="tap-target-48 w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-black text-xl py-4 px-8 rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 transition-transform active:scale-95 cursor-pointer"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>Empezar</span>
        </button>
      </div>
    </div>
  );
};
