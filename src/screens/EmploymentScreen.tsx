import React from 'react';
import { Briefcase, Hammer, Search, GraduationCap, Home, HeartHandshake, ShieldQuestion } from 'lucide-react';
import { EmploymentStatus } from '../types';
import { soundEffects } from '../lib/sound';

interface EmploymentScreenProps {
  onSelect: (status: EmploymentStatus) => void;
}

export const EmploymentScreen: React.FC<EmploymentScreenProps> = ({ onSelect }) => {
  const options: { id: EmploymentStatus; label: string; icon: React.ReactNode }[] = [
    { id: 'FORMAL', label: 'Empleo formal', icon: <Briefcase className="w-5 h-5 text-blue-600" /> },
    { id: 'INFORMAL', label: 'Trabajo por mi cuenta', icon: <Hammer className="w-5 h-5 text-amber-600" /> },
    { id: 'UNEMPLOYED', label: 'Busco trabajo', icon: <Search className="w-5 h-5 text-teal-600" /> },
    { id: 'STUDENT', label: 'Estudio', icon: <GraduationCap className="w-5 h-5 text-purple-600" /> },
    { id: 'HOME', label: 'Labores del hogar', icon: <Home className="w-5 h-5 text-pink-600" /> },
    { id: 'RETIRED', label: 'Jubilado o pensionado', icon: <HeartHandshake className="w-5 h-5 text-emerald-600" /> },
    { id: 'NA', label: 'Prefiero no decir', icon: <ShieldQuestion className="w-5 h-5 text-slate-400" /> },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between p-4 max-w-[420px] mx-auto w-full animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black text-slate-900 text-center mb-1">
          ¿A qué te dedicas?
        </h2>
        <p className="text-xs font-semibold text-slate-500 text-center mb-3">
          Toca una opción
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-2 pb-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              soundEffects.playTap();
              onSelect(opt.id);
            }}
            className="tap-target-48 w-full bg-white hover:bg-blue-50 active:bg-blue-100 border-2 border-slate-200 hover:border-blue-400 text-slate-800 rounded-2xl p-2.5 px-3.5 flex items-center gap-3 shadow-xs transition-all active:scale-[0.98]"
          >
            <div className="p-2 rounded-xl bg-slate-100 shrink-0">
              {opt.icon}
            </div>
            <span className="text-sm sm:text-base font-extrabold flex-1 text-left">
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
