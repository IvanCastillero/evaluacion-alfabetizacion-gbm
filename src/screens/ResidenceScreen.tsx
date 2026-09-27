import React, { useState } from 'react';
import { MapPin, Search, ChevronRight, X, HeartHandshake } from 'lucide-react';
import { Zone, ResidenceMethod } from '../types';
import zonasData from '../content/zonas.json';
import { searchZonas } from '../lib/searchZonas';
import { soundEffects } from '../lib/sound';

interface ResidenceScreenProps {
  kioskOriginId: string;
  onSelect: (zoneId?: string, method?: ResidenceMethod) => void;
}

export const ResidenceScreen: React.FC<ResidenceScreenProps> = ({
  kioskOriginId,
  onSelect,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Determinar chips según el kiosco
  const kioskInfo = (zonasData.kiosks as Record<string, { chips: string[] }>)[kioskOriginId];
  const chipNames = kioskInfo
    ? kioskInfo.chips
    : ['Curundú', 'Tocumen', 'Ancón', 'Bethania', 'Calidonia'];

  const allZonas: Zone[] = zonasData.zonas;

  // Encontrar objetos Zone para los chips
  const chipZones: Zone[] = chipNames
    .map((name) => allZonas.find((z) => z.name.toLowerCase() === name.toLowerCase()))
    .filter((z): z is Zone => z !== undefined);

  // Resultados del buscador
  const searchResults = showSearch ? searchZonas(searchQuery, allZonas) : [];

  const handleSelectChip = (zone: Zone) => {
    soundEffects.playTap();
    onSelect(zone.id, 'CHIP');
  };

  const handleSelectSearchResult = (zone: Zone) => {
    soundEffects.playTap();
    onSelect(zone.id, 'SEARCH');
  };

  const handleDecline = () => {
    soundEffects.playTap();
    onSelect(undefined, 'DECLINED');
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-5 max-w-[420px] mx-auto w-full animate-in fade-in duration-300">
      <div>
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-2 text-blue-700">
          <MapPin className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 text-center mb-1">
          ¿Dónde vives?
        </h2>
        <p className="text-xs font-semibold text-slate-500 text-center mb-4">
          Toca tu corregimiento o busca otro
        </p>
      </div>

      {/* Lista de Chips del Kiosco */}
      <div className="flex-1 flex flex-col justify-center space-y-2.5 pb-3">
        {chipZones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => handleSelectChip(zone)}
            className="tap-target-48 w-full bg-white hover:bg-blue-50 active:bg-blue-100 border-2 border-slate-200 hover:border-blue-400 text-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-xs transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-base font-extrabold text-slate-800">
                {zone.name}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        ))}

        {/* Botón para abrir el buscador */}
        <button
          type="button"
          onClick={() => {
            soundEffects.playTap();
            setShowSearch(true);
          }}
          className="tap-target-48 w-full bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border-2 border-blue-300 text-blue-800 rounded-2xl p-3.5 flex items-center justify-center gap-2 font-black text-base shadow-xs active:scale-[0.98] transition-all"
        >
          <Search className="w-5 h-5" />
          <span>Otro lugar</span>
        </button>
      </div>

      {/* Enlace discreto "Prefiero no decir" */}
      <div className="text-center pt-2 pb-4">
        <button
          type="button"
          onClick={handleDecline}
          className="text-xs font-bold text-slate-500 hover:text-slate-700 underline inline-flex items-center gap-1.5 p-2"
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Prefiero no decir</span>
        </button>
      </div>

      {/* Modal / Vista de Buscador */}
      {showSearch && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 items-center justify-start pt-8"
        >
          <div className="bg-white rounded-3xl p-5 max-w-[400px] w-full shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-black text-slate-900">Buscar corregimiento</h3>
              <button
                type="button"
                onClick={() => setShowSearch(false)}
                className="tap-target-48 p-2 text-slate-400 hover:text-slate-700 rounded-full"
                aria-label="Cerrar buscador"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative mb-3">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Escribe tu corregimiento (ej. Tocumen)..."
                autoFocus
                className="tap-target-48 w-full pl-11 pr-4 py-3 bg-slate-100 border-2 border-slate-300 focus:border-blue-600 focus:bg-white rounded-2xl text-base font-bold text-slate-900 outline-hidden transition-all"
              />
            </div>

            {/* Resultados (máximo 5 grandes) */}
            <div className="flex-1 overflow-y-auto space-y-2 py-1">
              {searchQuery.trim().length >= 2 ? (
                searchResults.length > 0 ? (
                  searchResults.map((zone) => (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => handleSelectSearchResult(zone)}
                      className="tap-target-48 w-full bg-slate-50 hover:bg-blue-50 active:bg-blue-100 border-2 border-slate-200 hover:border-blue-400 text-slate-800 rounded-2xl p-3 flex items-center justify-between text-left transition-all active:scale-[0.98]"
                    >
                      <span className="text-base font-extrabold text-slate-900">
                        {zone.name}
                      </span>
                      <ChevronRight className="w-5 h-5 text-blue-600" />
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">
                    No encontramos ese corregimiento. Intenta con otra letra.
                  </p>
                )
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">
                  Escribe al menos 2 letras para ver sugerencias
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowSearch(false)}
              className="tap-target-48 mt-3 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-sm"
            >
              Volver a los corregimientos principales
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
