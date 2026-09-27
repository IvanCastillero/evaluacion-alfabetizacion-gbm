import React, { useEffect, useState, useRef, useCallback } from 'react';
import { HelpCircle } from 'lucide-react';
import { soundEffects } from '../lib/sound';
import { speechService } from '../lib/speech';

interface InactivityHandlerProps {
  enabled: boolean;
  onAbandon: () => void;
}

export const InactivityHandler: React.FC<InactivityHandlerProps> = ({ enabled, onAbandon }) => {
  const [showWarning, setShowWarning] = useState(false);
  const warningTimerRef = useRef<number | null>(null);
  const abandonTimerRef = useRef<number | null>(null);

  const resetTimers = useCallback(() => {
    if (!enabled) return;

    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (abandonTimerRef.current) clearTimeout(abandonTimerRef.current);

    if (showWarning) {
      setShowWarning(false);
      speechService.stop();
    }

    // 45 segundos para el aviso
    warningTimerRef.current = window.setTimeout(() => {
      setShowWarning(true);
      soundEffects.playInactivityAlert();
      speechService.speak('¿Sigues ahí? Toca la pantalla para continuar.');
    }, 45000);

    // 90 segundos para abandono
    abandonTimerRef.current = window.setTimeout(() => {
      setShowWarning(false);
      speechService.stop();
      onAbandon();
    }, 90000);
  }, [enabled, showWarning, onAbandon]);

  useEffect(() => {
    if (!enabled) {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (abandonTimerRef.current) clearTimeout(abandonTimerRef.current);
      setShowWarning(false);
      return;
    }

    resetTimers();

    const activityEvents = ['touchstart', 'touchend', 'click', 'keydown', 'scroll'];
    const handleUserActivity = () => {
      resetTimers();
    };

    activityEvents.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (abandonTimerRef.current) clearTimeout(abandonTimerRef.current);
      activityEvents.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
    };
  }, [enabled, resetTimers]);

  if (!showWarning) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="inactivity-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
      onClick={resetTimers}
    >
      <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-xs w-full text-center border-2 border-blue-400 animate-bounce">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <HelpCircle className="w-10 h-10 text-blue-600" />
        </div>
        <h2 id="inactivity-title" className="text-xl font-black text-slate-900 mb-2">
          ¿Sigues ahí?
        </h2>
        <p className="text-sm font-medium text-slate-600 mb-4">
          Toca en cualquier parte para seguir jugando.
        </p>
        <button
          type="button"
          onClick={resetTimers}
          className="tap-target-48 w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg transition-transform active:scale-95"
        >
          ¡Sí, aquí estoy!
        </button>
      </div>
    </div>
  );
};
