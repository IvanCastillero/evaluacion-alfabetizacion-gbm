import React, { useState } from 'react';
import { ShieldCheck, UserX, HeartHandshake, Check, X, FileText } from 'lucide-react';
import { soundEffects } from '../lib/sound';

interface PrivacyScreenProps {
  onAccept: () => void;
  onReject: () => void;
}

export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onAccept, onReject }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex-1 flex flex-col justify-between p-5 max-w-[420px] mx-auto w-full animate-in fade-in duration-300">
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-700">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 text-center mb-6">
          Tu privacidad es primero
        </h2>

        {/* 3 puntos claros con iconos (menos de 40 palabras) */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-left">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-slate-800 leading-snug">
              Guardamos tu edad aproximada, tu zona y tus respuestas.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <UserX className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-slate-800 leading-snug">
              No pedimos nombre, cédula ni teléfono.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <HeartHandshake className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-slate-800 leading-snug">
              Sirve para llevar talleres a tu comunidad.
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 underline inline-flex items-center gap-1 p-2"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Leer más sobre privacidad</span>
          </button>
        </div>
      </div>

      {/* Zona inferior: Botones del mismo tamaño */}
      <div className="pb-6 pt-3 space-y-3">
        <button
          type="button"
          onClick={() => {
            soundEffects.playTap();
            onAccept();
          }}
          className="tap-target-48 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Check className="w-6 h-6 stroke-[3]" />
          <span>Acepto</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEffects.playTap();
            onReject();
          }}
          className="tap-target-48 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base py-4 px-6 rounded-2xl border border-slate-300 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <X className="w-5 h-5" />
          <span>No, gracias</span>
        </button>
      </div>

      {/* Modal Leer Más */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-left max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-black text-slate-900 mb-3">Política de Privacidad</h3>
            <div className="overflow-y-auto text-xs text-slate-600 space-y-3 pr-1">
              <p>
                Este prototipo de evaluación comunitaria es una iniciativa de Responsabilidad Social Empresarial de GBM.
              </p>
              <p>
                <strong>Datos recopilados:</strong> Únicamente se registran datos anónimos agregados (rango de edad, ocupación general, nivel de estudios y corregimiento). Nunca se solicita información de contacto ni datos biométricos.
              </p>
              <p>
                <strong>Uso de la información:</strong> Los resultados serán utilizados para identificar qué corregimientos tienen mayor necesidad de talleres de alfabetización tradicional y digital.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="tap-target-48 mt-5 w-full bg-blue-600 text-white font-bold py-3 rounded-xl"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
