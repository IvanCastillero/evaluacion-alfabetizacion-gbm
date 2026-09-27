import React from 'react';
import { Calendar, User, UserCheck, HeartHandshake } from 'lucide-react';
import { AgeGroup } from '../types';
import { soundEffects } from '../lib/sound';

interface AgeGroupScreenProps {
  onSelect: (group: AgeGroup) => void;
}

export const AgeGroupScreen: React.FC<AgeGroupScreenProps> = ({ onSelect }) => {
  const options: { id: AgeGroup; label: string; icon: React.ReactNode }[] = [
    { id: '18_24', label: '18 a 24 años', icon: <User className="w-6 h-6 text-blue-600" /> },
    { id: '25_34', label: '25 a 34 años', icon: <User className="w-6 h-6 text-teal-600" /> },
    { id: '35_44', label: '35 a 44 años', icon: <UserCheck className="w-6 h-6 text-emerald-600" /> },
    { id: '45_59', label: '45 a 59 años', icon: <UserCheck className="w-6 h-6 text-amber-600" /> },
    { id: '60_PLUS', label: '60 años o más', icon: <Calendar className="w-6 h-6 text-purple-600" /> },
    { id: 'NA', label: 'Prefiero no decir', icon: <HeartHandshake className="w-5 h-5 text-slate-400" /> },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between p-5 max-w-[420px] mx-auto w-full animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black text-slate-900 text-center mb-1">
          ¿Cuál es tu edad?
        </h2>
        <p className="text-xs font-semibold text-slate-500 text-center mb-4">
          Toca tu grupo de edad
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
            className="tap-target-48 w-full bg-white hover:bg-blue-50/80 active:bg-blue-100 border-2 border-slate-200 hover:border-blue-400 text-slate-800 rounded-2xl p-3.5 flex items-center gap-3.5 shadow-xs transition-all active:scale-[0.98]"
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
