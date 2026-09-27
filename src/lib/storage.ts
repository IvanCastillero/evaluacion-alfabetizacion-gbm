import {
  SessionData,
  AgeGroup,
  EmploymentStatus,
  EducationLevel,
} from '../types';
import zonasData from '../content/zonas.json';
import { calculateScores } from './scoring';

const SESSIONS_KEY = 'gbm_alfabetizacion_sessions_v1';
const ACTIVE_SESSION_KEY = 'gbm_alfabetizacion_active_session_v1';
const DEVICE_ID_KEY = 'gbm_anon_device_id_v1';
const LAST_REWARD_KEY = 'gbm_last_reward_timestamp_v1';

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Obtiene o crea un ID de dispositivo anónimo y no biométrico.
 */
export function getAnonDeviceId(): string {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = generateUUID();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    return 'fallback-device-' + Math.random().toString(36).substring(2, 9);
  }
}

/**
 * Verifica si el dispositivo es elegible para premio en las últimas 24 horas.
 */
export function checkRewardEligibility(): { eligible: boolean; repeat_device: boolean } {
  try {
    const lastRewardStr = localStorage.getItem(LAST_REWARD_KEY);
    if (lastRewardStr) {
      const lastRewardTime = parseInt(lastRewardStr, 10);
      const now = Date.now();
      const hoursPassed = (now - lastRewardTime) / (1000 * 60 * 60);
      if (hoursPassed < 24) {
        return { eligible: false, repeat_device: true };
      }
    }
    return { eligible: true, repeat_device: false };
  } catch {
    return { eligible: true, repeat_device: false };
  }
}

/**
 * Registra que se ha otorgado un premio en este dispositivo.
 */
export function recordRewardGranted() {
  try {
    localStorage.setItem(LAST_REWARD_KEY, Date.now().toString());
  } catch {}
}

/**
 * Obtiene todas las sesiones guardadas.
 */
export function getAllSessions(): SessionData[] {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    if (!data) return [];
    return JSON.parse(data) as SessionData[];
  } catch (e) {
    console.error('Error al leer sesiones de almacenamiento local:', e);
    return [];
  }
}

/**
 * Guarda o actualiza una sesión en el almacenamiento local.
 */
export function saveSession(session: SessionData): void {
  try {
    const sessions = getAllSessions();
    const existingIndex = sessions.findIndex((s) => s.session_id === session.session_id);

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Error al guardar sesión en almacenamiento local:', e);
  }
}

/**
 * Guarda el progreso en curso para permitir recuperación si se recarga la página.
 */
export function saveActiveSession(session: SessionData): void {
  try {
    localStorage.setItem(
      ACTIVE_SESSION_KEY,
      JSON.stringify({
        session,
        saved_at: Date.now(),
      })
    );
  } catch {}
}

/**
 * Recupera la sesión en curso si fue guardada hace menos de 10 minutos (600,000 ms).
 */
export function getRecoverableSession(): SessionData | null {
  try {
    const data = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    const timeDiff = Date.now() - parsed.saved_at;
    const TEN_MINUTES_MS = 10 * 60 * 1000;

    if (timeDiff < TEN_MINUTES_MS && parsed.session) {
      return parsed.session as SessionData;
    }
    // Si pasaron más de 10 min, limpiar
    clearActiveSession();
    return null;
  } catch {
    return null;
  }
}

/**
 * Limpia la sesión activa en curso.
 */
export function clearActiveSession(): void {
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {}
}

/**
 * Simula la sincronización de las sesiones pendientes.
 */
export function simulateSync(): number {
  try {
    const sessions = getAllSessions();
    let updatedCount = 0;
    const updated = sessions.map((s) => {
      if (!s.synced) {
        updatedCount++;
        return { ...s, synced: true };
      }
      return s;
    });
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    return updatedCount;
  } catch {
    return 0;
  }
}

/**
 * Borra todas las sesiones guardadas.
 */
export function clearAllStorageData(): void {
  try {
    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    localStorage.removeItem(LAST_REWARD_KEY);
  } catch (e) {
    console.error('Error al limpiar almacenamiento:', e);
  }
}

/**
 * Genera 50 sesiones de prueba realistas para evaluar el panel `/datos`.
 */
export function generateMockSessions(count = 50): void {
  try {
    const kiosks = ['PTYK001', 'PTYK002', 'PTYK003', 'UNKNOWN'];
    const ageGroups: AgeGroup[] = ['18_24', '25_34', '35_44', '45_59', '60_PLUS', 'NA'];
    const empStatuses: EmploymentStatus[] = [
      'FORMAL',
      'INFORMAL',
      'UNEMPLOYED',
      'STUDENT',
      'HOME',
      'RETIRED',
      'NA',
    ];
    const eduLevels: EducationLevel[] = [
      'PRIMARY_INCOMPLETE',
      'PRIMARY',
      'SECONDARY',
      'TERTIARY',
      'NA',
    ];
    const zones = zonasData.zonas;

    const mockSessions: SessionData[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const sessionId = generateUUID();
      const kiosk = kiosks[Math.floor(Math.random() * kiosks.length)];
      const assisted = Math.random() < 0.25;
      const isCompleted = Math.random() < 0.78; // 78% tasa de finalización
      const randomZone = zones[Math.floor(Math.random() * zones.length)];
      const startedAt = new Date(now - Math.random() * 86400000 * 3).toISOString();

      let lastStep = 'P17';
      let finishedAt: string | undefined = undefined;

      // 9 respuestas posibles
      const mockAnswers = [
        { item_id: 'R1_FARMACIA', choice: Math.random() < 0.8 ? 'DOMINGO' : 'LUNES', correct: Math.random() < 0.8, ms: 3500 + Math.floor(Math.random() * 4000), audio_used: Math.random() < 0.4, input: 'TAP' as const },
        { item_id: 'R1_MEDICINA', choice: Math.random() < 0.75 ? '8' : '12', correct: Math.random() < 0.75, ms: 3000 + Math.floor(Math.random() * 3000), audio_used: Math.random() < 0.35, input: 'TAP' as const },
        { item_id: 'R2_METRO', choice: Math.random() < 0.85 ? 'TARJETA' : 'PELOTA', correct: Math.random() < 0.85, ms: 2800 + Math.floor(Math.random() * 2500), audio_used: Math.random() < 0.3, input: 'TAP' as const },
        { item_id: 'R2_LLUVIA', choice: Math.random() < 0.8 ? 'PARAGUAS' : 'VASO', correct: Math.random() < 0.8, ms: 2500 + Math.floor(Math.random() * 2000), audio_used: Math.random() < 0.25, input: 'TAP' as const },
        { item_id: 'R3_BUSCAR', choice: Math.random() < 0.7 ? 'LUPA' : 'ENGRANAJE', correct: Math.random() < 0.7, ms: 4000 + Math.floor(Math.random() * 3500), audio_used: Math.random() < 0.5, input: 'TAP' as const },
        { item_id: 'R3_WIFI', choice: Math.random() < 0.75 ? 'WIFI' : 'CANDADO', correct: Math.random() < 0.75, ms: 3500 + Math.floor(Math.random() * 3000), audio_used: Math.random() < 0.45, input: 'TAP' as const },
        { item_id: 'R4_CLAVE_BANCO', choice: Math.random() < 0.85 ? 'RIESGO' : 'SEGURO', correct: Math.random() < 0.85, ms: 4200 + Math.floor(Math.random() * 3000), audio_used: Math.random() < 0.6, input: 'SWIPE' as const },
        { item_id: 'R4_BLOQUEO', choice: Math.random() < 0.7 ? 'SEGURO' : 'RIESGO', correct: Math.random() < 0.7, ms: 3800 + Math.floor(Math.random() * 2800), audio_used: Math.random() < 0.55, input: 'TAP' as const },
        { item_id: 'R4_ENLACE', choice: Math.random() < 0.8 ? 'RIESGO' : 'SEGURO', correct: Math.random() < 0.8, ms: 3900 + Math.floor(Math.random() * 2600), audio_used: Math.random() < 0.5, input: 'SWIPE' as const },
      ];

      const stepTimes: Record<string, number> = {
        P1: 2200 + Math.floor(Math.random() * 2000),
        P2: 4500 + Math.floor(Math.random() * 3000),
        P3: 1500 + Math.floor(Math.random() * 1500),
        P4: 2100 + Math.floor(Math.random() * 1800),
        P5: 2800 + Math.floor(Math.random() * 2000),
        P6: 2500 + Math.floor(Math.random() * 1800),
        P7: 5000 + Math.floor(Math.random() * 4000),
        P8: 6000 + Math.floor(Math.random() * 3000),
      };

      let scoresRecord;
      if (isCompleted) {
        lastStep = 'P17';
        finishedAt = new Date(new Date(startedAt).getTime() + 120000 + Math.random() * 60000).toISOString();
        const litCorrect = mockAnswers.slice(0, 4).filter((a) => a.correct).length;
        const iconCorrect = mockAnswers.slice(4, 6).filter((a) => a.correct).length;
        const cardCorrect = mockAnswers.slice(6, 9).filter((a) => a.correct).length;
        const calculated = calculateScores(litCorrect, iconCorrect, cardCorrect);
        scoresRecord = {
          s_lit: calculated.s_lit,
          s_dig: calculated.s_dig,
          s_total: calculated.s_total,
          category: calculated.category,
        };
      } else {
        const abandonSteps = ['P4', 'P5', 'P7', 'P9', 'P10', 'P12', 'P13'];
        lastStep = abandonSteps[Math.floor(Math.random() * abandonSteps.length)];
      }

      mockSessions.push({
        session_id: sessionId,
        kiosk_origin_id: kiosk,
        anon_device_id: generateUUID(),
        assisted,
        consent_version: 'CONS_PROTO_01',
        status: isCompleted ? 'COMPLETED' : 'ABANDONED',
        last_step: lastStep as any,
        demographics: {
          age_group: ageGroups[Math.floor(Math.random() * ageGroups.length)],
          employment_status: empStatuses[Math.floor(Math.random() * empStatuses.length)],
          education_level: eduLevels[Math.floor(Math.random() * eduLevels.length)],
        },
        residence_zone_id: randomZone.id,
        residence_method: Math.random() < 0.6 ? 'CHIP' : Math.random() < 0.9 ? 'SEARCH' : 'DECLINED',
        answers: isCompleted ? mockAnswers : mockAnswers.slice(0, Math.floor(Math.random() * 5)),
        step_times_ms: stepTimes,
        scores: scoresRecord,
        satisfaction: isCompleted ? (Math.random() < 0.65 ? 3 : Math.random() < 0.85 ? 2 : 1) : undefined,
        reward: isCompleted
          ? {
              eligible: kiosk !== 'UNKNOWN',
              code: kiosk !== 'UNKNOWN' ? Math.floor(1000 + Math.random() * 9000).toString() : '',
              repeat_device: false,
            }
          : undefined,
        started_at: startedAt,
        finished_at: finishedAt,
        synced: Math.random() < 0.5,
      });
    }

    const currentSessions = getAllSessions();
    localStorage.setItem(SESSIONS_KEY, JSON.stringify([...currentSessions, ...mockSessions]));
  } catch (e) {
    console.error('Error al generar sesiones simuladas:', e);
  }
}
