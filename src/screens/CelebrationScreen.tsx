import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { TrophyIllustration } from '../components/Illustrations';
import { soundEffects } from '../lib/sound';
import { Lightbulb, ArrowRight } from 'lucide-react';
import itemsData from '../content/items.json';

interface CelebrationScreenProps {
  onContinue: () => void;
}

export const CelebrationScreen: React.FC<CelebrationScreenProps> = ({ onContinue }) => {
  const [randomTip, setRandomTip] = useState<string>('');

  useEffect(() => {
    soundEffects.playCelebration();

    // Lanzar confeti suave si el usuario no prefiere movimiento reducido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00A3E0', '#002F6C', '#FFB81C', '#00875A'],
        });
      } catch {}
    }

    const tips = itemsData.tips || [
      'Nunca compartas tu clave del banco, ni con familiares.',
      'Si un mensaje te promete un premio y pide tus datos, es trampa.',
      'Pon una clave a tu celular para proteger tu información.',
    ];
    const picked = tips[Math.floor(Math.random() * tips.length)];
    setRandomTip(picked);
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between p-5 max-w-[420px] mx-auto w-full text-center animate-in fade-in duration-300">
      {/* Trofeo y título */}
      <div className="my-auto flex flex-col items-center">
        <TrophyIllustration className="w-32 h-32 mb-3 animate-bounce" />

        <h1 className="text-3xl font-black text-slate-900 mb-2">
          ¡Lo lograste!
        </h1>

        <p className="text-sm font-semibold text-slate-600 mb-6 max-w-xs">
          Completaste todos los retos con éxito. ¡Muchísimas gracias por participar!
        </p>

        {/* Consejo útil de ciberseguridad */}
        <div className="w-full bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-left shadow-xs flex items-start gap-3">
          <div className="p-2 bg-amber-200/60 rounded-xl text-amber-800 shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block mb-0.5">
              Consejo útil para tu celular
            </span>
            <p className="text-sm font-bold text-slate-800 leading-snug">
              {randomTip}
            </p>
          </div>
        </div>
      </div>

      {/* Botón grande para continuar */}
      <div className="pb-6 pt-3 w-full">
        <button
          type="button"
          onClick={() => {
            soundEffects.playTap();
            onContinue();
          }}
          className="tap-target-48 w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-black text-xl py-4 px-8 rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform"
        >
          <span>Continuar</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
