import React from 'react';
import { RotateCcw, Play } from 'lucide-react';
import { SessionData } from '../types';

interface RecoveryModalProps {
  session: SessionData;
  onContinue: () => void;
  onRestart: () => void;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({
  onContinue,
  onRestart,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="recovery-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs"
    >
      <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center border-2 border-slate-200">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <RotateCcw className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 id="recovery-title" className="text-xl font-black text-slate-900 mb-2">
          ¿Deseas continuar?
        </h2>
        <p className="text-sm text-slate-600 font-medium mb-6">
          Encontramos tu partida en curso. Puedes continuar donde quedaste o empezar de nuevo.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onContinue}
            className="tap-target-48 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2 text-base active:scale-95 transition-transform"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Continuar donde quedaste</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="tap-target-48 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-2xl text-sm active:scale-95 transition-transform"
          >
            Empezar de nuevo
          </button>
        </div>
      </div>
    </div>
  );
};
