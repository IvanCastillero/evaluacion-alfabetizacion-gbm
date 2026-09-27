import React, { useState, useEffect } from 'react';
import { GiftIllustration } from '../components/Illustrations';
import { soundEffects } from '../lib/sound';
import { Loader2, Ticket, CheckCircle2, ArrowRight } from 'lucide-react';

interface RewardScreenProps {
  isUnknownKiosk: boolean;
  repeatDevice: boolean;
  rewardCode: string;
  isOnline: boolean;
  onContinue: () => void;
}

export const RewardScreen: React.FC<RewardScreenProps> = ({
  isUnknownKiosk,
  repeatDevice,
  rewardCode,
  isOnline,
  onContinue,
}) => {
  // Si está offline, salta la espera de 1.5s según la regla:
  // "Si no hay conexión, mostrar directamente el código 'Muestra este código al promotor'"
  const [loading, setLoading] = useState(isOnline && !repeatDevice && !isUnknownKiosk);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
        soundEffects.playSuccess();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <div className="flex-1 flex flex-col justify-between p-5 max-w-[420px] mx-auto w-full text-center animate-in fade-in duration-300">
      <div className="my-auto flex flex-col items-center">
        {loading ? (
          /* Estado de preparación (1.5s) */
          <div className="py-12 flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
            <h2 className="text-2xl font-black text-slate-800">
              Preparando tu premio...
            </h2>
            <p className="text-sm font-semibold text-slate-500 mt-2">
              Un momento por favor
            </p>
          </div>
        ) : isUnknownKiosk ? (
          /* Caso Kiosco UNKNOWN: Sin premio, mensaje comunitario */
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-700 mb-4">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              ¡Aporte registrado!
            </h2>
            <p className="text-sm font-semibold text-slate-600 max-w-xs leading-relaxed">
              Tus respuestas nos ayudarán a decidir en qué corregimientos brindar talleres de tecnología y lectura. ¡Gracias por participar!
            </p>
          </div>
        ) : repeatDevice ? (
          /* Caso repetido en 24h */
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-700 mb-4">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              ¡Gracias por jugar otra vez!
            </h2>
            <p className="text-sm font-semibold text-slate-600 max-w-xs leading-relaxed">
              Hoy ya recibiste tu premio. Tu nueva participación sigue ayudando a tu comunidad.
            </p>
          </div>
        ) : (
          /* Caso con premio y código de 4 dígitos */
          <div className="flex flex-col items-center w-full">
            <GiftIllustration className="w-24 h-24 mb-2" />

            <h2 className="text-2xl font-black text-slate-900 mb-1">
              {isOnline ? '¡Listo! Retíralo en el kiosco' : '¡Listo! Muestra tu código'}
            </h2>

            <p className="text-xs font-semibold text-slate-600 mb-4">
              {isOnline
                ? 'Ingresa este código en la pantalla del kiosco:'
                : 'Muestra este código al promotor del kiosco:'}
            </p>

            {/* Tarjeta con código de 4 dígitos */}
            <div className="w-full max-w-xs bg-gradient-to-br from-blue-700 to-blue-900 text-white p-5 rounded-3xl shadow-xl border-4 border-yellow-400 relative overflow-hidden">
              <div className="absolute top-2 right-3 text-yellow-400 opacity-20">
                <Ticket className="w-16 h-16" />
              </div>
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-widest block mb-1">
                Código de Canje
              </span>
              <div className="text-4xl sm:text-5xl font-mono font-black tracking-widest text-yellow-300 drop-shadow">
                {rewardCode}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botón para continuar */}
      {!loading && (
        <div className="pb-6 pt-3 w-full">
          <button
            type="button"
            onClick={() => {
              soundEffects.playTap();
              onContinue();
            }}
            className="tap-target-48 w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-lg py-4 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <span>Continuar</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
