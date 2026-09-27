import React, { useEffect, useState } from 'react';
import { HeartHandshake, Check, RefreshCw } from 'lucide-react';
import { soundEffects } from '../lib/sound';

interface ClosingScreenProps {
  onFinish: () => void;
}

export const ClosingScreen: React.FC<ClosingScreenProps> = ({ onFinish }) => {
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="flex-1 flex flex-col justify-between p-5 max-w-[420px] mx-auto w-full text-center animate-in fade-in duration-300">
      <div className="my-auto flex flex-col items-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-700 mb-4 shadow-inner">
          <HeartHandshake className="w-12 h-12" />
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-2">
          ¡Muchas gracias!
        </h1>

        <p className="text-base font-semibold text-slate-600 max-w-xs mb-6 leading-relaxed">
          Tu tiempo y esfuerzo son muy valiosos para mejorar las oportunidades en tu comunidad.
        </p>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Volviendo al inicio en {secondsLeft} s</span>
        </div>
      </div>

      {/* Botón Terminar */}
      <div className="pb-6 pt-3 w-full">
        <button
          type="button"
          onClick={() => {
            soundEffects.playTap();
            onFinish();
          }}
          className="tap-target-48 w-full bg-blue-700 hover:bg-blue-800 text-white font-black text-xl py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform"
        >
          <Check className="w-6 h-6 stroke-[3]" />
          <span>Terminar</span>
        </button>
      </div>
    </div>
  );
};
