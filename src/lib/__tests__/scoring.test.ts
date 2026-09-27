import { describe, it, expect } from 'vitest';
import { calculateScores, calculateSessionScores } from '../scoring';
import { defaultScoringThresholds } from '../scoringConfig';
import { AnswerRecord } from '../../types';

describe('Cálculo de puntuación y clasificación (Sección 8)', () => {
  // Casos de prueba obligatorios de la tabla de la Sección 8
  const testCases = [
    { lit: 4, icons: 2, cards: 3, expectedLit: 50, expectedDig: 50, expectedCat: 'VERDE' },
    { lit: 2, icons: 1, cards: 2, expectedLit: 25, expectedDig: 29.17, expectedCat: 'VERDE' },
    { lit: 3, icons: 0, cards: 3, expectedLit: 37.5, expectedDig: 25, expectedCat: 'VERDE' },
    { lit: 3, icons: 1, cards: 1, expectedLit: 37.5, expectedDig: 20.83, expectedCat: 'AMARILLO' },
    { lit: 2, icons: 0, cards: 2, expectedLit: 25, expectedDig: 16.67, expectedCat: 'AMARILLO' },
    { lit: 1, icons: 2, cards: 3, expectedLit: 12.5, expectedDig: 50, expectedCat: 'ROJO' },
    { lit: 0, icons: 0, cards: 0, expectedLit: 0, expectedDig: 0, expectedCat: 'ROJO' },
  ];

  testCases.forEach(({ lit, icons, cards, expectedLit, expectedDig, expectedCat }, index) => {
    it(`Caso obligatorio ${index + 1}: Lectura=${lit}, Íconos=${icons}, Tarjetas=${cards} -> Lit=${expectedLit}, Dig=${expectedDig}, Cat=${expectedCat}`, () => {
      const result = calculateScores(lit, icons, cards);
      expect(result.s_lit).toBe(expectedLit);
      expect(result.s_dig).toBe(expectedDig);
      expect(result.category).toBe(expectedCat);
    });
  });

  it('Caso 3 específico: 3 tarjetas exactas dan 25 exacto sin fallo de coma flotante', () => {
    const result = calculateScores(3, 0, 3);
    expect(result.s_dig_raw).toBe(25);
    expect(result.s_dig).toBe(25);
    expect(result.category).toBe('VERDE');
  });

  it('No puntúa sesiones incompletas (menos de 9 ítems)', () => {
    const incompleteAnswers: AnswerRecord[] = [
      { item_id: 'R1_FARMACIA', choice: 'DOMINGO', correct: true, ms: 1000, audio_used: false, input: 'TAP' },
      { item_id: 'R1_MEDICINA', choice: '8', correct: true, ms: 1000, audio_used: false, input: 'TAP' },
    ];
    const scores = calculateSessionScores(incompleteAnswers);
    expect(scores).toBeUndefined();
  });

  it('Puntúa correctamente una sesión completa de 9 respuestas', () => {
    const completeAnswers: AnswerRecord[] = [
      { item_id: 'R1_FARMACIA', choice: 'DOMINGO', correct: true, ms: 1000, audio_used: false, input: 'TAP' },
      { item_id: 'R1_MEDICINA', choice: '8', correct: true, ms: 1000, audio_used: false, input: 'TAP' },
      { item_id: 'R2_METRO', choice: 'TARJETA', correct: true, ms: 1000, audio_used: false, input: 'TAP' },
      { item_id: 'R2_LLUVIA', choice: 'PARAGUAS', correct: true, ms: 1000, audio_used: false, input: 'TAP' },
      { item_id: 'R3_BUSCAR', choice: 'LUPA', correct: true, ms: 1000, audio_used: false, input: 'TAP' },
      { item_id: 'R3_AJUSTES', choice: 'ENGRANAJE', correct: true, ms: 1000, audio_used: false, input: 'TAP' },
      { item_id: 'R4_CLAVE_BANCO', choice: 'RIESGO', correct: true, ms: 1000, audio_used: false, input: 'TAP' },
      { item_id: 'R4_BLOQUEO', choice: 'SEGURO', correct: true, ms: 1000, audio_used: false, input: 'TAP' },
      { item_id: 'R4_TIENDA', choice: 'SEGURO', correct: true, ms: 1000, audio_used: false, input: 'TAP' },
    ];
    // 4 lit, 2 icons, 3 cards -> 50 lit, 50 dig, VERDE
    const scores = calculateSessionScores(completeAnswers);
    expect(scores).toBeDefined();
    expect(scores?.s_lit).toBe(50);
    expect(scores?.s_dig).toBe(50);
    expect(scores?.s_total).toBe(100);
    expect(scores?.category).toBe('VERDE');
  });

  it('Permite umbrales configurables externos', () => {
    const customThresholds = {
      ...defaultScoringThresholds,
      litCutoff: 30, // Más exigente para lit
    };
    // Con 2 aciertos de lectura (25 pts), normalmente pasaría con cutoff 25, pero con cutoff 30 debe ser ROJO
    const result = calculateScores(2, 2, 3, customThresholds);
    expect(result.s_lit).toBe(25);
    expect(result.category).toBe('ROJO');
  });
});
