import React, { useState } from 'react';
import { Sparkles, Touchpad, ArrowRight, Check } from 'lucide-react';
import { soundEffects } from '../lib/sound';

interface PracticeScreenProps {
  onComplete: () => void;
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'TAP_EXAMPLE' | 'SWIPE_EXAMPLE'>('TAP_EXAMPLE');
  const [tapped, setTapped] = useState(false);
  const [swiped, setSwiped] = useState(false);

  const handleTapAction = () => {
    soundEffects.playTap();
    setTapped(true);
    setTimeout(() => {
      soundEffects.playSuccess();
      setStep('SWIPE_EXAMPLE');
    }, 600);
  };

  const handleSwipeAction = () => {
    soundEffects.playSwipe();
    setSwiped(true);
    setTimeout(() => {
      soundEffects.playSuccess();
      onComplete();
    }, 600);
  };

  const handleSkip = () => {
    soundEffects.playTap();
    onComplete();
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-5 max-w-[420px] mx-auto w-full animate-in fade-in duration-300">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mb-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Práctica (sin puntos)</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 text-center mb-1">
          {step === 'TAP_EXAMPLE' ? 'Así se juega: Tocar' : 'Así se juega: Deslizar'}
        </h2>
        <p className="text-xs font-semibold text-slate-500 text-center mb-4">
          {step === 'TAP_EXAMPLE'
            ? 'Toca el botón azul para probar'
            : 'Desliza o toca un botón'}
        </p>
      </div>

      {/* Área interactiva de práctica */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        {step === 'TAP_EXAMPLE' ? (
          <div className="w-full max-w-xs flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={handleTapAction}
              className={`tap-target-48 w-full p-6 rounded-3xl font-black text-xl shadow-lg transition-all flex items-center justify-center gap-3 ${
                tapped
                  ? 'bg-emerald-600 text-white scale-105'
                  : 'bg-blue-600 text-white active:scale-95 animate-pulse'
              }`}
            >
              {tapped ? <Check className="w-8 h-8 stroke-[3]" /> : <Touchpad className="w-8 h-8" />}
              <span>{tapped ? '¡Excelente!' : '¡Tócame aquí!'}</span>
            </button>
            <p className="text-xs text-slate-500 font-medium text-center">
              En las preguntas, solo toca la opción que elijas.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-xs flex flex-col items-center gap-4">
            <div
              className={`w-full p-6 rounded-3xl border-2 border-slate-300 bg-white shadow-md text-center transition-all ${
                swiped ? 'translate-x-12 opacity-50 bg-emerald-50' : ''
              }`}
            >
              <p className="text-base font-extrabold text-slate-800">
                Tarjeta de ejemplo
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Toca uno de los dos botones abajo:
              </p>
            </div>

            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={handleSwipeAction}
                className="tap-target-48 flex-1 bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3.5 rounded-2xl shadow active:scale-95 transition-transform"
              >
                Riesgo
              </button>
              <button
                type="button"
                onClick={handleSwipeAction}
                className="tap-target-48 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-2xl shadow active:scale-95 transition-transform"
              >
                Seguro
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Botón "Ya sé jugar" para saltar la práctica */}
      <div className="pb-6 pt-3 text-center">
        <button
          type="button"
          onClick={handleSkip}
          className="tap-target-48 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-4 px-6 rounded-2xl border border-slate-300 flex items-center justify-center gap-2 text-sm active:scale-95 transition-transform"
        >
          <span>Ya sé jugar (Empezar retos)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
