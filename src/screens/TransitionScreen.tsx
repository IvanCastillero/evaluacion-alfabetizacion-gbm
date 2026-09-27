import React, { useEffect } from 'react';
import { Sparkles, Star } from 'lucide-react';
import { soundEffects } from '../lib/sound';

interface TransitionScreenProps {
  onContinue: () => void;
}

export const TransitionScreen: React.FC<TransitionScreenProps> = ({ onContinue }) => {
  useEffect(() => {
    soundEffects.playSuccess();
    const timer = setTimeout(() => {
      onContinue();
    }, 1800);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div
      onClick={onContinue}
      className="flex-1 flex flex-col items-center justify-center p-5 text-center cursor-pointer select-none animate-in fade-in zoom-in-95 duration-300"
    >
      <div className="relative mb-6">
        <div className="w-28 h-28 bg-amber-100 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
          <Star className="w-16 h-16 text-amber-500 fill-amber-400" />
        </div>
        <Sparkles className="w-8 h-8 text-amber-500 absolute -top-1 -right-1 animate-bounce" />
        <Sparkles className="w-6 h-6 text-yellow-500 absolute -bottom-1 -left-1 animate-bounce delay-150" />
      </div>

      <h2 className="text-3xl font-black text-slate-900 mb-2">
        ¡Vas muy bien!
      </h2>

      <p className="text-sm font-semibold text-slate-600 max-w-xs mb-6">
        Completaste los retos de lectura. ¡Ahora vamos con los retos del celular!
      </p>

      <span className="text-xs font-bold text-slate-400">
        Toca para continuar o espera un segundo...
      </span>
    </div>
  );
};
