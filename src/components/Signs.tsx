import React from 'react';

export const FarmaciaSign: React.FC = () => {
  return (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-b from-emerald-600 to-emerald-700 text-white p-4 rounded-2xl shadow-md border-4 border-emerald-500/50 flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
          <path d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5V4z" />
        </svg>
        <span className="text-2xl font-black tracking-wider uppercase">FARMACIA</span>
      </div>
      <div className="w-full h-0.5 bg-emerald-400/40 my-2" />
      <p className="text-sm font-semibold tracking-wide">
        HORARIO: Lunes a sábado 8:00 a.m. a 6:00 p.m.
      </p>
      <div className="mt-2 bg-red-600/90 text-white font-black px-3 py-1 rounded-lg text-sm tracking-wide shadow-inner">
        Domingo CERRADO
      </div>
    </div>
  );
};

export const MedicinaSign: React.FC = () => {
  return (
    <div className="w-full max-w-sm mx-auto bg-white border-2 border-slate-300 rounded-2xl p-4 shadow-md text-slate-800 flex items-center gap-4">
      <div className="w-16 h-20 bg-amber-100 border-2 border-amber-300 rounded-lg flex flex-col items-center justify-center shrink-0 shadow-inner">
        <div className="w-8 h-2 bg-amber-400 rounded-sm mb-1" />
        <svg className="w-8 h-8 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
          <path d="m8.5 8.5 7 7" />
        </svg>
      </div>
      <div className="flex-1 text-left">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Receta Médica</div>
        <p className="text-base font-extrabold text-blue-900 mt-0.5">
          Tomar 1 pastilla cada <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-black text-lg">8</span> horas
        </p>
        <p className="text-xs font-medium text-slate-600 mt-1">
          después de comer
        </p>
      </div>
    </div>
  );
};

export const PisoMojadoSign: React.FC = () => {
  return (
    <div className="w-full max-w-xs mx-auto bg-amber-300 border-4 border-amber-400 text-slate-900 rounded-2xl p-4 shadow-md flex flex-col items-center text-center">
      <div className="flex items-center gap-1.5 font-black text-lg text-amber-950 uppercase tracking-wider">
        <svg className="w-6 h-6 text-amber-950 fill-current" viewBox="0 0 24 24">
          <path d="M12 2L1 21h22L12 2zm0 3.5L20 19H4L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
        </svg>
        <span>CUIDADO</span>
      </div>
      {/* Silueta resbalando */}
      <svg className="w-20 h-20 text-slate-950 my-1" viewBox="0 0 100 100" fill="currentColor">
        <circle cx="55" cy="20" r="8" />
        {/* Cuerpo inclinado resbalando */}
        <path d="M48 30 L60 45 L40 60 L25 55" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* Piernas volando por resbalón */}
        <path d="M40 60 L65 75 L80 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M40 60 L30 80 L15 85" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* Manos en el aire */}
        <path d="M52 35 L75 25" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* Suelo y gotas de agua */}
        <path d="M10 90 L90 90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M40 93 Q50 88 60 93" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
      </svg>
      <div className="bg-slate-900 text-amber-300 font-black text-base px-3 py-1 rounded uppercase tracking-wider">
        PISO MOJADO
      </div>
    </div>
  );
};

export const BusSign: React.FC = () => {
  return (
    <div className="w-full max-w-sm mx-auto bg-blue-700 text-white rounded-2xl p-4 shadow-md border-4 border-blue-600 flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M8 6v6" />
          <path d="M16 6v6" />
          <path d="M4 12h16" />
          <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="17" cy="18" r="2" />
        </svg>
        <span className="text-xl font-black uppercase tracking-wider">PARADA DE BUS</span>
      </div>
      <div className="w-full h-0.5 bg-blue-400/40 my-1" />
      <p className="text-sm font-bold text-blue-100">
        RUTA: Albrook a Tocumen
      </p>
      <div className="mt-2 bg-yellow-400 text-blue-950 font-black px-3 py-1 rounded-lg text-sm shadow">
        Sale cada 15 minutos
      </div>
    </div>
  );
};
