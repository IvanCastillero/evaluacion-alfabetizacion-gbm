import React, { useState, useEffect, useRef } from 'react';
import { QuestionItem, AnswerRecord } from '../types';
import { FarmaciaSign, MedicinaSign, PisoMojadoSign, BusSign } from '../components/Signs';
import { soundEffects } from '../lib/sound';
import { Calendar, Clock, Footprints, Bath, DoorOpen, CigaretteOff } from 'lucide-react';

interface Reto1ScreenProps {
  item: QuestionItem;
  itemIndex: number; // 0 o 1
  totalItems: number; // 2
  audioUsed: boolean;
  onAnswer: (answer: AnswerRecord) => void;
}

export const Reto1Screen: React.FC<Reto1ScreenProps> = ({
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
    if (selectedId) return; // evitar doble toque
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
    }, 250);
  };

  // Renderizar el letrero correspondiente
  const renderSign = () => {
    switch (item.id) {
      case 'R1_FARMACIA':
        return <FarmaciaSign />;
      case 'R1_MEDICINA':
        return <MedicinaSign />;
      case 'R1_PISO':
        return <PisoMojadoSign />;
      case 'R1_BUS':
        return <BusSign />;
      default:
        return null;
    }
  };

  // Renderizar ícono de opción si aplica
  const renderOptionIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Calendar':
        return <Calendar className="w-5 h-5 text-blue-600 shrink-0" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'Footprints':
        return <Footprints className="w-6 h-6 text-red-600 shrink-0" />;
      case 'Bath':
        return <Bath className="w-6 h-6 text-slate-500 shrink-0" />;
      case 'DoorOpen':
        return <DoorOpen className="w-6 h-6 text-slate-500 shrink-0" />;
      case 'CigaretteOff':
        return <CigaretteOff className="w-6 h-6 text-slate-500 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 max-w-[420px] mx-auto w-full animate-in fade-in duration-300">
      {/* Encabezado del reto */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 mb-1.5">
          <span>Reto 1: Mira el letrero ({itemIndex + 1} de {totalItems})</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug px-1">
          {item.prompt}
        </h2>
      </div>

      {/* Ilustración SVG del letrero */}
      <div className="my-2.5 flex items-center justify-center">
        {renderSign()}
      </div>

      {/* Opciones de respuesta en cuadrícula o lista (4 opciones grandes) */}
      <div className="grid grid-cols-2 gap-2.5 pb-4">
        {item.options?.map((opt) => {
          const isSelected = selectedId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={!!selectedId}
              onClick={() => handleSelect(opt.id)}
              className={`tap-target-48 w-full min-h-[58px] p-3 rounded-2xl border-2 flex items-center justify-center gap-2 text-center transition-all active:scale-95 ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white hover:bg-blue-50/80 active:bg-blue-100 border-slate-300 text-slate-900 shadow-xs'
              }`}
            >
              {renderOptionIcon(opt.icon)}
              <span className="text-base font-black leading-tight">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
