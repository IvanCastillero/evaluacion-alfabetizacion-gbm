import React from 'react';
import { Frown, Meh, Smile, ArrowRight } from 'lucide-react';
import { soundEffects } from '../lib/sound';

interface SatisfactionScreenProps {
  onSelect: (rating?: number) => void;
}

export const SatisfactionScreen: React.FC<SatisfactionScreenProps> = ({ onSelect }) => {
  const options = [
    { rating: 1, label: 'Poco', icon: <Frown className="w-12 h-12 text-slate-500" />, bg: 'hover:bg-slate-100 border-slate-200' },
    { rating: 2, label: 'Bien', icon: <Meh className="w-12 h-12 text-amber-500" />, bg: 'hover:bg-amber-50 border-amber-200' },
    { rating: 3, label: '¡Mucho!', icon: <Smile className="w-12 h-12 text-emerald-500" />, bg: 'hover:bg-emerald-50 border-emerald-200' },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between p-5 max-w-[420px] mx-auto w-full text-center animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          ¿Te gustó la actividad?
        </h2>
        <p className="text-xs font-semibold text-slate-500 mb-6">
          Toca una carita o salta este paso
        </p>
      </div>

      {/* 3 caritas grandes */}
      <div className="my-auto flex items-center justify-center gap-3 py-4">
        {options.map((opt) => (
          <button
            key={opt.rating}
            type="button"
            onClick={() => {
              soundEffects.playTap();
              onSelect(opt.rating);
            }}
            className={`tap-target-48 flex-1 min-h-[120px] bg-white border-2 ${opt.bg} rounded-3xl p-3 flex flex-col items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer`}
          >
            {opt.icon}
            <span className="text-sm font-extrabold text-slate-800">
              {opt.label}
            </span>
          </button>
        ))}
      </div>

      {/* Botón Saltar */}
      <div className="pb-6 pt-3">
        <button
          type="button"
          onClick={() => {
            soundEffects.playTap();
            onSelect(undefined);
          }}
          className="tap-target-48 w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 px-6 rounded-2xl border border-slate-300 flex items-center justify-center gap-2 text-sm active:scale-95 transition-transform"
        >
          <span>Saltar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
