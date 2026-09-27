import React, { useState, useEffect, useMemo } from 'react';
import {
  getAllSessions,
  clearAllStorageData,
  generateMockSessions,
  simulateSync,
} from '../lib/storage';
import { SessionData } from '../types';
import zonasData from '../content/zonas.json';
import itemsData from '../content/items.json';
import {
  Lock,
  Download,
  Trash2,
  RefreshCw,
  PlusCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Users,
  Check,
  BarChart3,
} from 'lucide-react';

function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export const AdminPanel: React.FC<{ onBackToApp: () => void }> = ({ onBackToApp }) => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const reloadData = () => {
    setSessions(getAllSessions());
  };

  useEffect(() => {
    if (isAuthenticated) {
      reloadData();
    }
  }, [isAuthenticated]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '2026') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Métricas agregadas
  const metrics = useMemo(() => {
    const totalStarted = sessions.length;
    const completed = sessions.filter((s) => s.status === 'COMPLETED');
    const abandoned = sessions.filter((s) => s.status === 'ABANDONED');
    const completionRate = totalStarted > 0 ? Math.round((completed.length / totalStarted) * 100) : 0;

    // Duraciones totales en segundos
    const totalDurations = completed
      .map((s) => {
        if (!s.finished_at) return 0;
        return (new Date(s.finished_at).getTime() - new Date(s.started_at).getTime()) / 1000;
      })
      .filter((d) => d > 0);

    const medianTotalDurationSec = calculateMedian(totalDurations);

    // Duración de retos (P9 a P13)
    const challengeDurations = completed.map((s) => {
      let sum = 0;
      ['P9', 'P10', 'P11', 'P12', 'P13'].forEach((step) => {
        sum += (s.step_times_ms[step] || 0) / 1000;
      });
      return sum;
    });
    const medianChallengeDurationSec = calculateMedian(challengeDurations);

    // Embudo de pasos
    const allSteps = [
      'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8',
      'P9', 'P10', 'P11', 'P12', 'P13', 'P14', 'P15', 'P16', 'P17',
    ];

    const funnel = allSteps.map((step) => {
      // Sesiones que registraron tiempo o llegaron a este paso
      const count = sessions.filter((s) => s.step_times_ms[step] !== undefined || s.last_step === step).length;
      const stepTimes = sessions
        .map((s) => s.step_times_ms[step])
        .filter((t): t is number => typeof t === 'number');
      return {
        step,
        count,
        medianMs: calculateMedian(stepTimes),
      };
    });

    // Distribución por categoría
    const categoriesCount = {
      VERDE: completed.filter((s) => s.scores?.category === 'VERDE').length,
      AMARILLO: completed.filter((s) => s.scores?.category === 'AMARILLO').length,
      ROJO: completed.filter((s) => s.scores?.category === 'ROJO').length,
    };

    // Distribución por residencia
    const zoneMap: Record<string, number> = {};
    sessions.forEach((s) => {
      if (s.residence_zone_id) {
        zoneMap[s.residence_zone_id] = (zoneMap[s.residence_zone_id] || 0) + 1;
      }
    });

    const residenceDistribution = Object.entries(zoneMap).map(([zoneId, count]) => {
      const zoneObj = zonasData.zonas.find((z) => z.id === zoneId);
      return {
        name: zoneObj ? zoneObj.name : zoneId,
        count,
      };
    }).sort((a, b) => b.count - a.count);

    // Desglose por ítem
    const itemStatsMap: Record<string, { total: number; correct: number; times: number[]; audioUsed: number }> = {};
    itemsData.items.forEach((it) => {
      itemStatsMap[it.id] = { total: 0, correct: 0, times: [], audioUsed: 0 };
    });

    sessions.forEach((s) => {
      s.answers?.forEach((ans) => {
        if (!itemStatsMap[ans.item_id]) {
          itemStatsMap[ans.item_id] = { total: 0, correct: 0, times: [], audioUsed: 0 };
        }
        itemStatsMap[ans.item_id].total += 1;
        if (ans.correct) itemStatsMap[ans.item_id].correct += 1;
        itemStatsMap[ans.item_id].times.push(ans.ms);
        if (ans.audio_used) itemStatsMap[ans.item_id].audioUsed += 1;
      });
    });

    const itemStats = Object.entries(itemStatsMap).map(([itemId, st]) => {
      const accuracy = st.total > 0 ? Math.round((st.correct / st.total) * 100) : 0;
      const audioPercent = st.total > 0 ? Math.round((st.audioUsed / st.total) * 100) : 0;
      const medianMs = calculateMedian(st.times);
      return {
        itemId,
        total: st.total,
        accuracy,
        audioPercent,
        medianMs,
      };
    }).filter((st) => st.total > 0);

    return {
      totalStarted,
      completed: completed.length,
      abandoned: abandoned.length,
      completionRate,
      medianTotalDurationSec,
      medianChallengeDurationSec,
      funnel,
      categoriesCount,
      residenceDistribution,
      itemStats,
    };
  }, [sessions]);

  // Exportar JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `gbm_sesiones_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    notify('Archivo JSON exportado');
  };

  // Exportar CSV
  const handleExportCSV = () => {
    if (sessions.length === 0) {
      notify('No hay sesiones para exportar');
      return;
    }
    const headers = [
      'session_id',
      'kiosk_origin_id',
      'assisted',
      'status',
      'last_step',
      'age_group',
      'employment_status',
      'education_level',
      'residence_zone_id',
      'residence_zone_name',
      'residence_method',
      's_lit',
      's_dig',
      's_total',
      'category',
      'satisfaction',
      'reward_eligible',
      'reward_code',
      'started_at',
      'finished_at',
      'synced',
    ];

    const rows = sessions.map((s) => {
      const zoneObj = zonasData.zonas.find((z) => z.id === s.residence_zone_id);
      return [
        s.session_id,
        s.kiosk_origin_id,
        s.assisted ? 'SI' : 'NO',
        s.status,
        s.last_step,
        s.demographics?.age_group || '',
        s.demographics?.employment_status || '',
        s.demographics?.education_level || '',
        s.residence_zone_id || '',
        zoneObj ? `"${zoneObj.name}"` : '',
        s.residence_method || '',
        s.scores?.s_lit ?? '',
        s.scores?.s_dig ?? '',
        s.scores?.s_total ?? '',
        s.scores?.category ?? '',
        s.satisfaction ?? '',
        s.reward?.eligible ? 'SI' : 'NO',
        s.reward?.code || '',
        s.started_at,
        s.finished_at || '',
        s.synced ? 'SI' : 'NO',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows].join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `gbm_sesiones_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    notify('Archivo CSV exportado');
  };

  // Simular sincronización
  const handleSimulateSync = () => {
    const count = simulateSync();
    reloadData();
    notify(`${count} sesiones sincronizadas`);
  };

  // Generar 50 sesiones de prueba
  const handleGenerateMocks = () => {
    generateMockSessions(50);
    reloadData();
    notify('50 sesiones de prueba generadas');
  };

  // Borrar todo
  const handleClearData = () => {
    clearAllStorageData();
    reloadData();
    setShowClearConfirm(false);
    notify('Todos los datos fueron borrados');
  };

  // Vista de bloqueo por PIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl">
          <div className="w-14 h-14 bg-blue-900/60 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black mb-1">Panel de Datos GBM</h2>
          <p className="text-xs text-slate-400 mb-5">Ingresa el PIN de acceso del equipo</p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full text-center tracking-[1em] text-2xl font-mono py-3 bg-slate-950 border-2 border-slate-700 focus:border-blue-500 rounded-xl outline-hidden"
              autoFocus
            />

            {pinError && (
              <p className="text-xs font-bold text-red-400">
                PIN incorrecto. Intenta con 2026.
              </p>
            )}

            <button
              type="submit"
              className="tap-target-48 w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl transition-all"
            >
              Acceder
            </button>

            <button
              type="button"
              onClick={onBackToApp}
              className="text-xs text-slate-400 hover:text-white pt-2 underline block mx-auto"
            >
              Volver a la evaluación
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-4 sm:p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado del panel */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                Administración
              </span>
              <span className="text-xs font-bold text-slate-400">PIN 2026</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Panel de Evaluación Comunitaria
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToApp}
              className="tap-target-48 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la App</span>
            </button>
          </div>
        </div>

        {/* Notificación flotante */}
        {notification && (
          <div className="mb-4 p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold text-center animate-in fade-in">
            {notification}
          </div>
        )}

        {/* Barra de Acciones */}
        <div className="flex flex-wrap gap-2.5 mb-6">
          <button
            type="button"
            onClick={handleExportJSON}
            className="tap-target-48 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Exportar JSON</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="tap-target-48 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateSync}
            className="tap-target-48 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className="w-4 h-4 text-teal-600" />
            <span>Simular Sincronización</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateMocks}
            className="tap-target-48 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generar 50 de prueba</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="tap-target-48 ml-auto px-3.5 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Borrar Todo</span>
          </button>
        </div>

        {/* Tarjetas de Contadores Clave */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-1">
              <Users className="w-4 h-4" />
              <span>Iniciadas</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{metrics.totalStarted}</div>
            <div className="text-[11px] text-slate-500 font-medium">Sesiones totales</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold mb-1">
              <CheckCircle className="w-4 h-4" />
              <span>Completadas</span>
            </div>
            <div className="text-2xl font-black text-emerald-700">{metrics.completed}</div>
            <div className="text-[11px] text-slate-500 font-medium">{metrics.completionRate}% de éxito</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold mb-1">
              <Clock className="w-4 h-4" />
              <span>Duración Mediana</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{metrics.medianTotalDurationSec}s</div>
            <div className="text-[11px] text-slate-500 font-medium">Tiempo total completado</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 text-blue-600 text-xs font-bold mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Retos Mediana</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{metrics.medianChallengeDurationSec}s</div>
            <div className="text-[11px] text-slate-500 font-medium">P9 a P13 acumulado</div>
          </div>
        </div>

        {/* Cuadrícula de Distribución y Embudo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Distribución por Categoría */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">
              Clasificación RSE (Completadas: {metrics.completed})
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-700">VERDE (Baja prioridad RSE)</span>
                  <span>{metrics.categoriesCount.VERDE} ({metrics.completed ? Math.round((metrics.categoriesCount.VERDE / metrics.completed) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${metrics.completed ? (metrics.categoriesCount.VERDE / metrics.completed) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-amber-700">AMARILLO (Refuerzo digital necesario)</span>
                  <span>{metrics.categoriesCount.AMARILLO} ({metrics.completed ? Math.round((metrics.categoriesCount.AMARILLO / metrics.completed) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${metrics.completed ? (metrics.categoriesCount.AMARILLO / metrics.completed) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-red-700">ROJO (Prioridad urgente lectoescritura)</span>
                  <span>{metrics.categoriesCount.ROJO} ({metrics.completed ? Math.round((metrics.categoriesCount.ROJO / metrics.completed) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full transition-all"
                    style={{ width: `${metrics.completed ? (metrics.categoriesCount.ROJO / metrics.completed) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Embudo de Pasos */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">
              Embudo de Navegación por Paso
            </h3>
            <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5 text-xs">
              {metrics.funnel.map((fn) => (
                <div key={fn.step} className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg">
                  <span className="font-extrabold text-slate-700">{fn.step}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500 font-medium">{fn.medianMs > 0 ? `${(fn.medianMs / 1000).toFixed(1)}s med.` : '-'}</span>
                    <span className="font-black text-slate-900 min-w-[36px] text-right">{fn.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Residencia e Ítems */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Top Corregimientos */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">
              Distribución por Corregimiento
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
              {metrics.residenceDistribution.length > 0 ? (
                metrics.residenceDistribution.map((r, i) => (
                  <div key={r.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span className="font-extrabold text-slate-800">
                      {i + 1}. {r.name}
                    </span>
                    <span className="font-black text-blue-700 px-2 py-0.5 bg-blue-100 rounded-md">
                      {r.count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 py-4 text-center">No hay datos de residencia registrados</p>
              )}
            </div>
          </div>

          {/* Desglose por Ítem */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">
              Métricas por Ítem
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
              {metrics.itemStats.length > 0 ? (
                metrics.itemStats.map((st) => (
                  <div key={st.itemId} className="p-2 rounded-xl bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-black text-slate-800">{st.itemId}</div>
                      <div className="text-[10px] text-slate-500">
                        {st.total} respuestas · Audio: {st.audioPercent}%
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-md font-black ${st.accuracy >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {st.accuracy}% acierto
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {(st.medianMs / 1000).toFixed(1)}s med.
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 py-4 text-center">No hay respuestas registradas</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabla de Sesiones Recientes */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">
            Sesiones Registradas ({sessions.length})
          </h3>
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-black border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Kiosco</th>
                  <th className="p-2.5">Estado</th>
                  <th className="p-2.5">Corregimiento</th>
                  <th className="p-2.5">Categoría</th>
                  <th className="p-2.5">S_Lit / S_Dig</th>
                  <th className="p-2.5">Sincronizado</th>
                  <th className="p-2.5">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {sessions.map((s) => {
                  const zoneObj = zonasData.zonas.find((z) => z.id === s.residence_zone_id);
                  return (
                    <tr key={s.session_id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold">{s.kiosk_origin_id}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${s.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-2.5">{zoneObj ? zoneObj.name : s.residence_method === 'DECLINED' ? 'Declinado' : '-'}</td>
                      <td className="p-2.5">
                        {s.scores ? (
                          <span className={`px-2 py-0.5 rounded-md font-black text-[11px] ${
                            s.scores.category === 'VERDE' ? 'bg-emerald-100 text-emerald-800' :
                            s.scores.category === 'AMARILLO' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {s.scores.category}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-2.5">
                        {s.scores ? `${s.scores.s_lit} / ${s.scores.s_dig}` : '-'}
                      </td>
                      <td className="p-2.5">
                        {s.synced ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Sí
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold">Pendiente</span>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-400">
                        {new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de confirmación para borrar datos (sin alert nativo) */}
        {showClearConfirm && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          >
            <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl border border-slate-200">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">
                ¿Borrar todos los datos?
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Esta acción eliminará permanentemente todas las sesiones locales guardadas en este dispositivo.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="tap-target-48 flex-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleClearData}
                  className="tap-target-48 flex-1 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow"
                >
                  Sí, borrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
