import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { QuestionItem, AnswerRecord, InputMethod } from '../types';
import { soundEffects } from '../lib/sound';
import { ShieldAlert, ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';

interface Reto4ScreenProps {
  item: QuestionItem;
  itemIndex: number; // 0, 1, 2
  totalItems: number; // 3
  audioUsed: boolean;
  onAnswer: (answer: AnswerRecord) => void;
}

export const Reto4Screen: React.FC<Reto4ScreenProps> = ({
  item,
  itemIndex,
  totalItems,
  audioUsed,
  onAnswer,
}) => {
  const startTimeRef = useRef<number>(Date.now());
  const [answered, setAnswered] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  // Framer Motion drag coordinates
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.4, 1, 1, 1, 0.4]);

  // Transformar colores de borde y fondo dinámicamente con el arrastre
  const borderColor = useTransform(
    x,
    [-150, -50, 0, 50, 150],
    ['#EF4444', '#F59E0B', '#E2E8F0', '#10B981', '#059669']
  );

  useEffect(() => {
    startTimeRef.current = Date.now();
    setAnswered(false);
    setExitDirection(null);
    x.set(0);
  }, [item.id, x]);

  const handleDecision = (choice: 'RIESGO' | 'SEGURO', method: InputMethod) => {
    if (answered) return;
    setAnswered(true);
    setExitDirection(choice === 'RIESGO' ? 'left' : 'right');
    soundEffects.playSwipe();

    const elapsedMs = Date.now() - startTimeRef.current;
    const isCorrect = choice === item.correct;

    setTimeout(() => {
      onAnswer({
        item_id: item.id,
        choice,
        correct: isCorrect,
        ms: elapsedMs,
        audio_used: audioUsed,
        input: method,
      });
    }, 350);
  };

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (answered) return;
    const threshold = 70; // Sensibilidad adecuada para celular
    if (info.offset.x < -threshold) {
      handleDecision('RIESGO', 'SWIPE');
    } else if (info.offset.x > threshold) {
      handleDecision('SEGURO', 'SWIPE');
    } else {
      // Rebotar al centro si no superó el umbral
      x.set(0);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 max-w-[420px] mx-auto w-full animate-in fade-in duration-300 select-none">
      {/* Encabezado */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 mb-2">
          <span>Reto 4: ¿Riesgo o Seguro? ({itemIndex + 1} de {totalItems})</span>
        </div>
        <p className="text-xs font-semibold text-slate-500">
          Desliza la tarjeta o usa los botones abajo
        </p>
      </div>

      {/* Tarjeta interactiva con soporte para arrastre táctil */}
      <div className="my-auto py-2 flex items-center justify-center relative min-h-[220px]">
        <motion.div
          style={{ x, rotate, opacity, borderColor }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.8}
          onDragEnd={handleDragEnd}
          animate={
            exitDirection === 'left'
              ? { x: -350, opacity: 0, rotate: -25 }
              : exitDirection === 'right'
              ? { x: 350, opacity: 0, rotate: 25 }
              : { x: 0 }
          }
          className="w-full max-w-[320px] bg-white rounded-3xl p-6 shadow-xl border-4 cursor-grab active:cursor-grabbing text-center flex flex-col items-center justify-center gap-4 relative overflow-hidden"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
            <span className="text-2xl">📱</span>
          </div>

          <p className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
            {item.prompt}
          </p>

          <div className="flex items-center justify-between w-full text-[11px] font-bold text-slate-400 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1 text-amber-600">
              <ArrowLeft className="w-3.5 h-3.5" />
              Riesgo
            </span>
            <span className="text-slate-400">Desliza</span>
            <span className="flex items-center gap-1 text-emerald-600">
              Seguro
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </motion.div>
      </div>

      {/* Botones táctiles siempre visibles en la mitad inferior */}
      <div className="pb-4 pt-2">
        <div className="flex items-center gap-3 w-full">
          {/* Botón Riesgo (Izquierda) */}
          <button
            type="button"
            disabled={answered}
            onClick={() => handleDecision('RIESGO', 'TAP')}
            className="tap-target-48 flex-1 min-h-[64px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:from-amber-700 active:to-amber-800 text-white font-black text-lg rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <span>Riesgo</span>
          </button>

          {/* Botón Seguro (Derecha) */}
          <button
            type="button"
            disabled={answered}
            onClick={() => handleDecision('SEGURO', 'TAP')}
            className="tap-target-48 flex-1 min-h-[64px] bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:from-emerald-800 active:to-emerald-900 text-white font-black text-lg rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-6 h-6 shrink-0" />
            <span>Seguro</span>
          </button>
        </div>
      </div>
    </div>
  );
};
