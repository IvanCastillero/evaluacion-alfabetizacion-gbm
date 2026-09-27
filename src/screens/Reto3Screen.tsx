import React, { useState, useEffect, useRef } from 'react';
import { QuestionItem, AnswerRecord } from '../types';
import { soundEffects } from '../lib/sound';
import { Search, Settings, Lock, Wifi, ArrowLeft, Home, X, Plus } from 'lucide-react';

interface Reto3ScreenProps {
  item: QuestionItem;
  itemIndex: number; // 0 o 1
  totalItems: number; // 2
  audioUsed: boolean;
  onAnswer: (answer: AnswerRecord) => void;
}

export const Reto3Screen: React.FC<Reto3ScreenProps> = ({
  item,
  itemIndex,
  totalItems,
  audioUsed,
  onAnswer,
}) => {
  const startTimeRef = useRef<number>(Date.now());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setSelectedId(null);
  }, [item.id]);

  const handleSelect = (optionId: string) => {
    if (selectedId) return;
    setSelectedId(optionId);
    soundEffects.playTap();

    const elapsedMs = Date.now() - startTimeRef.current;
    const isCorrect = optionId === item.correct;

    setTimeout(() => {
      onAnswer({
        item_id: item.id,
        choice: optionId,
        correct: isCorrect,
        ms: elapsedMs,
        audio_used: audioUsed,
        input: 'TAP',
      });
    }, 300);
  };

  const renderIcon = (iconName?: string) => {
    const iconClass = 'w-10 h-10';
    switch (iconName) {
      case 'Search': return <Search className={iconClass} />;
      case 'Settings': return <Settings className={iconClass} />;
      case 'Lock': return <Lock className={iconClass} />;
      case 'Wifi': return <Wifi className={iconClass} />;
      case 'ArrowLeft': return <ArrowLeft className={iconClass} />;
      case 'Home': return <Home className={iconClass} />;
      case 'X': return <X className={iconClass} />;
      case 'Plus': return <Plus className={iconClass} />;
      default: return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 max-w-[420px] mx-auto w-full animate-in fade-in duration-300">
      {/* Encabezado e Instrucción */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 mb-2">
          <span>Reto 3: Íconos del celular ({itemIndex + 1} de {totalItems})</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug px-2">
          {item.prompt}
        </h2>
      </div>

      {/* Cuadrícula 2x2 de íconos del teléfono (botones táctiles grandes) */}
      <div className="grid grid-cols-2 gap-4 my-auto py-2">
        {item.options?.map((opt) => {
          const isSelected = selectedId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={!!selectedId}
              onClick={() => handleSelect(opt.id)}
              className={`tap-target-48 min-h-[110px] p-4 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                  : 'bg-white hover:bg-blue-50/80 active:bg-blue-100 border-slate-300 text-slate-800'
              }`}
            >
              <div className={`p-2 rounded-2xl ${isSelected ? 'text-white' : 'text-blue-600 bg-blue-50'}`}>
                {renderIcon(opt.icon)}
              </div>
              <span className="text-sm font-black tracking-wide">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="pb-4 text-center">
        <p className="text-xs font-semibold text-slate-500">
          Toca el ícono correcto para continuar
        </p>
      </div>
    </div>
  );
};
