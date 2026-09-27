import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, LogOut, WifiOff, Sparkles } from 'lucide-react';
import { speechService } from '../lib/speech';
import { soundEffects } from '../lib/sound';

interface HeaderNavProps {
  currentStepIndex: number;
  totalSteps?: number;
  starsCount?: number;
  showProgress?: boolean;
  showExit?: boolean;
  onExit?: () => void;
  assisted?: boolean;
  audioText?: string;
  onAudioTriggered?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentStepIndex,
  totalSteps = 17,
  starsCount = 0,
  showProgress = true,
  showExit = true,
  onExit,
  assisted = false,
  audioText,
  onAudioTriggered,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const unsubscribe = speechService.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAudioClick = () => {
    if (isSpeaking) {
      speechService.stop();
    } else if (audioText) {
      soundEffects.playTap();
      if (onAudioTriggered) onAudioTriggered();
      speechService.speak(audioText);
    }
  };

  const progressPercent = Math.min(100, Math.round((currentStepIndex / totalSteps) * 100));

  return (
    <header className="w-full bg-white/95 backdrop-blur-sm border-b border-slate-200/80 sticky top-0 z-40 px-3 py-2">
      {/* Barra superior de estado */}
      <div className="flex items-center justify-between gap-2 max-w-[420px] mx-auto">
        {/* Lado izquierdo: Distintivos (Asistido, Offline) */}
        <div className="flex items-center gap-1.5 min-w-[70px]">
          {assisted && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
              Asistido
            </span>
          )}
          {!isOnline && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 animate-pulse">
              <WifiOff className="w-3 h-3" />
              <span>Sin conexión</span>
            </span>
          )}
        </div>

        {/* Centro: Estrellas de gamificación */}
        {starsCount > 0 && (
          <div
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full shadow-sm"
            aria-label={`${starsCount} estrellas obtenidas`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400 animate-bounce" />
            <span className="text-xs font-black text-amber-800">{starsCount}</span>
          </div>
        )}

        {/* Lado derecho: Botón grande de audio y botón discreto salir */}
        <div className="flex items-center gap-1.5 ml-auto">
          {audioText && (
            <button
              type="button"
              onClick={handleAudioClick}
              className={`tap-target-48 flex items-center justify-center rounded-full px-3 py-2 text-sm font-bold transition-all shadow-sm ${
                isSpeaking
                  ? 'bg-blue-600 text-white ring-4 ring-blue-300 animate-pulse'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
              aria-label={isSpeaking ? 'Pausar audio' : 'Escuchar instrucción'}
              title="Escuchar instrucción"
            >
              {isSpeaking ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-blue-700" />
              )}
              <span className="ml-1 text-xs font-extrabold">{isSpeaking ? 'Pausar' : 'Escuchar'}</span>
            </button>
          )}

          {showExit && onExit && (
            <button
              type="button"
              onClick={onExit}
              className="tap-target-48 flex items-center justify-center p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              aria-label="Salir de la sesión"
              title="Salir"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-[11px] font-medium ml-1">Salir</span>
            </button>
          )}
        </div>
      </div>

      {/* Camino / Barra de progreso */}
      {showProgress && (
        <div className="mt-2 w-full max-w-[420px] mx-auto">
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
            <div
              className="bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
};
