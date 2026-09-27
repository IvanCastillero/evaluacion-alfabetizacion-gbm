import React from 'react';
import { UserCheck, Check, X } from 'lucide-react';
import { soundEffects } from '../lib/sound';

interface AgeCheckScreenProps {
  onYes: () => void;
  onNo: () => void;
}

export const AgeCheckScreen: React.FC<AgeCheckScreenProps> = ({ onYes, onNo }) => {
  return (
    <div className="flex-1 flex flex-col justify-between p-5 max-w-[420px] mx-auto w-full animate-in fade-in duration-300">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-700 mb-6">
          <UserCheck className="w-9 h-9" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug max-w-xs">
          ¿Tienes 18 años o más?
        </h2>
        <p className="text-sm font-medium text-slate-500 mt-3">
          Toca una opción para continuar
        </p>
      </div>

      <div className="pb-6 pt-3 space-y-4 w-full">
        <button
          type="button"
          onClick={() => {
            soundEffects.playTap();
            onYes();
          }}
          className="tap-target-48 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl py-5 px-6 rounded-3xl shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform"
        >
          <Check className="w-7 h-7 stroke-[3]" />
          <span>Sí</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEffects.playTap();
            onNo();
          }}
          className="tap-target-48 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-lg py-5 px-6 rounded-3xl border border-slate-300 flex items-center justify-center gap-3 active:scale-95 transition-transform"
        >
          <X className="w-6 h-6" />
          <span>No</span>
        </button>
      </div>
    </div>
  );
};
