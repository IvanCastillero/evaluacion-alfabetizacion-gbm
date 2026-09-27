import React, { useState, useEffect, useRef } from 'react';
import { QuestionItem, AnswerRecord } from '../types';
import { soundEffects } from '../lib/sound';
import { CreditCard, Utensils, Footprints, CircleDot, Umbrella, Hammer, BookOpen, CupSoda, Pill, Wheat, Fuel, Shirt, Hand, Disc, Square, Key } from 'lucide-react';

interface Reto2ScreenProps {
  item: QuestionItem;
  itemIndex: number; // 0 o 1
  totalItems: number; // 2
  audioUsed: boolean;
  onAnswer: (answer: AnswerRecord) => void;
}

export const Reto2Screen: React.FC<Reto2ScreenProps> = ({
  item,
  itemIndex,
  totalItems,
  audioUsed,
  onAnswer,
}) => {
  const startTimeRef = useRef<number>(Date.now());
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setSelectedWord(null);
  }, [item.id]);

  const handleSelect = (optionId: string, label: string) => {
    if (selectedWord) return;
    setSelectedWord(label);
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
    }, 350);
  };

  const renderOptionIcon = (iconName?: string) => {
    const props = { className: 'w-6 h-6 text-blue-600 shrink-0' };
    switch (iconName) {
      case 'CreditCard': return <CreditCard {...props} />;
      case 'Utensils': return <Utensils {...props} />;
      case 'Footprints': return <Footprints {...props} />;
      case 'CircleDot': return <CircleDot {...props} />;
      case 'Umbrella': return <Umbrella {...props} />;
      case 'Hammer': return <Hammer {...props} />;
      case 'BookOpen': return <BookOpen {...props} />;
      case 'CupSoda': return <CupSoda {...props} />;
      case 'Pill': return <Pill {...props} />;
      case 'Wheat': return <Wheat {...props} />;
      case 'Fuel': return <Fuel {...props} />;
      case 'Shirt': return <Shirt {...props} />;
      case 'Hand': return <Hand {...props} />;
      case 'Disc': return <Disc {...props} />;
      case 'Square': return <Square {...props} />;
      case 'Key': return <Key {...props} />;
      default: return null;
    }
  };

  const sentenceParts = item.sentence_parts || [item.prompt, ''];

  return (
    <div className="flex-1 flex flex-col justify-between p-4 max-w-[420px] mx-auto w-full animate-in fade-in duration-300">
      {/* Encabezado */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 mb-2">
          <span>Reto 2: Completa la frase ({itemIndex + 1} de {totalItems})</span>
        </div>
        <p className="text-xs font-semibold text-slate-500">
          Toca la palabra que falta
        </p>
      </div>

      {/* Frase grande con espacio en blanco */}
      <div className="my-auto py-6 px-4 bg-white rounded-3xl border-2 border-slate-200 shadow-sm text-center">
        <p className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-relaxed">
          {sentenceParts[0]}{' '}
          <span
            className={`inline-block min-w-[110px] px-3 py-1 rounded-xl border-2 border-dashed transition-all duration-200 text-center font-black ${
              selectedWord
                ? 'bg-blue-600 text-white border-blue-600 scale-105'
                : 'bg-blue-50/70 border-blue-400 text-blue-800'
            }`}
          >
            {selectedWord ? selectedWord : '____'}
          </span>{' '}
          {sentenceParts[1]}
        </p>
      </div>

      {/* 4 palabras con ícono en cuadrícula */}
      <div className="grid grid-cols-2 gap-2.5 pb-4">
        {item.options?.map((opt) => {
          const isSelected = selectedWord === opt.label;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={!!selectedWord}
              onClick={() => handleSelect(opt.id, opt.label)}
              className={`tap-target-48 w-full min-h-[64px] p-3 rounded-2xl border-2 flex items-center justify-start gap-3 transition-all active:scale-95 ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white hover:bg-blue-50/80 active:bg-blue-100 border-slate-300 text-slate-900 shadow-xs'
              }`}
            >
              <div className="p-1.5 rounded-xl bg-slate-100 shrink-0">
                {renderOptionIcon(opt.icon)}
              </div>
              <span className="text-base font-extrabold capitalize text-left">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
