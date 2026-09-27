import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveSession,
  getAllSessions,
  clearAllStorageData,
  checkRewardEligibility,
  recordRewardGranted,
  generateUUID,
} from '../storage';
import { SessionData } from '../../types';
import zonasData from '../../content/zonas.json';

class MockStorage {
  private store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = String(value); }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}

if (typeof localStorage === 'undefined') {
  (globalThis as any).localStorage = new MockStorage();
}

describe('Reglas de negocio y persistencia (Criterios 4, 12, 14, 15, 16)', () => {
  beforeEach(() => {
    clearAllStorageData();
  });

  it('Criterio 12: Guarda sesiones con la estructura completa requerida en Sección 9', () => {
    const session: SessionData = {
      session_id: generateUUID(),
      kiosk_origin_id: 'PTYK001',
      anon_device_id: 'test-device-uuid',
      assisted: false,
      consent_version: 'CONS_PROTO_01',
      status: 'COMPLETED',
      last_step: 'P17',
      demographics: {
        age_group: '35_44',
        employment_status: 'INFORMAL',
        education_level: 'PRIMARY_INCOMPLETE',
      },
      residence_zone_id: 'Z005',
      residence_method: 'CHIP',
      answers: [
        {
          item_id: 'R1_FARMACIA',
          choice: 'DOMINGO',
          correct: true,
          ms: 6200,
          audio_used: true,
          input: 'TAP',
        },
      ],
      step_times_ms: { P1: 2100, P2: 5400 },
      scores: {
        s_lit: 37.5,
        s_dig: 25,
        s_total: 62.5,
        category: 'VERDE',
      },
      satisfaction: 3,
      reward: { eligible: true, code: '4821', repeat_device: false },
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      synced: false,
    };

    saveSession(session);
    const retrieved = getAllSessions();
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].session_id).toBe(session.session_id);
    expect(retrieved[0].kiosk_origin_id).toBe('PTYK001');
    expect(retrieved[0].scores?.category).toBe('VERDE');
    expect(retrieved[0].answers[0].audio_used).toBe(true);
    expect(retrieved[0].step_times_ms.P1).toBe(2100);
  });

  it('Criterio 15: Un segundo intento en el mismo dispositivo en 24 h no es elegible y marca repeat_device: true', () => {
    // Primer intento
    const firstCheck = checkRewardEligibility();
    expect(firstCheck.eligible).toBe(true);
    expect(firstCheck.repeat_device).toBe(false);

    // Otorgar premio
    recordRewardGranted();

    // Segundo intento inmediato (dentro de las 24h)
    const secondCheck = checkRewardEligibility();
    expect(secondCheck.eligible).toBe(false);
    expect(secondCheck.repeat_device).toBe(true);
  });

  it('Criterio 16: Validación de kioscos existentes vs UNKNOWN', () => {
    const validKiosks = Object.keys(zonasData.kiosks);
    expect(validKiosks).toContain('PTYK001');
    expect(validKiosks).toContain('PTYK002');
    expect(validKiosks).toContain('PTYK003');

    const checkKiosk = (id: string | null) => {
      if (id && (zonasData.kiosks as any)[id]) {
        return id;
      }
      return 'UNKNOWN';
    };

    expect(checkKiosk('PTYK001')).toBe('PTYK001');
    expect(checkKiosk('INVALID_ID')).toBe('UNKNOWN');
    expect(checkKiosk(null)).toBe('UNKNOWN');
  });

  it('Criterio 14: Sesión sin conexión permanece en estado synced: false hasta sincronizar', () => {
    const session: SessionData = {
      session_id: generateUUID(),
      kiosk_origin_id: 'PTYK002',
      anon_device_id: 'device-offline',
      assisted: true,
      consent_version: 'CONS_PROTO_01',
      status: 'COMPLETED',
      last_step: 'P17',
      answers: [],
      step_times_ms: {},
      started_at: new Date().toISOString(),
      synced: false,
    };

    saveSession(session);
    const sessions = getAllSessions();
    expect(sessions[0].synced).toBe(false);
  });
});
