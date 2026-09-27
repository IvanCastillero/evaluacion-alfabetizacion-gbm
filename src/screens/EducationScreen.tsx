import React from 'react';
import { BookOpen, BookCheck, GraduationCap, Award, ShieldQuestion } from 'lucide-react';
import { EducationLevel } from '../types';
import { soundEffects } from '../lib/sound';

interface EducationScreenProps {
  onSelect: (level: EducationLevel) => void;
}

export const EducationScreen: React.FC<EducationScreenProps> = ({ onSelect }) => {
  const options: { id: EducationLevel; label: string; icon: React.ReactNode }[] = [
    { id: 'PRIMARY_INCOMPLETE', label: 'Primaria sin terminar', icon: <BookOpen className="w-5 h-5 text-amber-600" /> },
    { id: 'PRIMARY', label: 'Primaria completa', icon: <BookCheck className="w-5 h-5 text-teal-600" /> },
    { id: 'SECONDARY', label: 'Secundaria', icon: <Award className="w-5 h-5 text-blue-600" /> },
    { id: 'TERTIARY', label: 'Técnico o universidad', icon: <GraduationCap className="w-5 h-5 text-purple-600" /> },
    { id: 'NA', label: 'Prefiero no decir', icon: <ShieldQuestion className="w-5 h-5 text-slate-400" /> },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between p-5 max-w-[420px] mx-auto w-full animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black text-slate-900 text-center mb-1">
          Nivel de estudios
        </h2>
        <p className="text-xs font-semibold text-slate-500 text-center mb-4">
          Toca hasta dónde estudiaste
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-2.5 pb-4">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              soundEffects.playTap();
              onSelect(opt.id);
            }}
            className="tap-target-48 w-full bg-white hover:bg-blue-50 active:bg-blue-100 border-2 border-slate-200 hover:border-blue-400 text-slate-800 rounded-2xl p-3.5 flex items-center gap-3.5 shadow-xs transition-all active:scale-[0.98]"
          >
            <div className="p-2 rounded-xl bg-slate-100 shrink-0">
              {opt.icon}
            </div>
            <span className="text-base font-extrabold flex-1 text-left">
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
