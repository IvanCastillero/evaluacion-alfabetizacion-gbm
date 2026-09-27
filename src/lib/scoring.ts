import { AnswerRecord, Category, ScoresRecord } from '../types';
import { defaultScoringThresholds, ScoringThresholds } from './scoringConfig';

const EPSILON = 1e-9;

export function roundTo2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export interface RawScores {
  s_lit_raw: number;
  s_dig_raw: number;
  s_total_raw: number;
  s_lit: number;
  s_dig: number;
  s_total: number;
  category: Category;
}

/**
 * Función pura para calcular puntuaciones a partir de los aciertos en cada reto.
 * Se compara con valores sin redondear (con tolerancia infinitesimal a coma flotante).
 */
export function calculateScores(
  litCorrect: number,
  iconsCorrect: number,
  cardsCorrect: number,
  thresholds: ScoringThresholds = defaultScoringThresholds
): RawScores {
  const s_lit_raw = litCorrect * thresholds.litMultiplier;
  
  // Cálculo exacto fraccionario: cardsCorrect * (num / den)
  const cardsContribution =
    (cardsCorrect * thresholds.digCardNumerator) / thresholds.digCardDenominator;
  const s_dig_raw = iconsCorrect * thresholds.digIconMultiplier + cardsContribution;
  
  const s_total_raw = s_lit_raw + s_dig_raw;

  // Comparación contra umbrales sin redondear (con protección contra imprecisiones IEEE 754)
  const isLitPass = s_lit_raw + EPSILON >= thresholds.litCutoff;
  const isDigPass = s_dig_raw + EPSILON >= thresholds.digCutoff;

  let category: Category;
  if (!isLitPass) {
    category = 'ROJO';
  } else if (!isDigPass) {
    category = 'AMARILLO';
  } else {
    category = 'VERDE';
  }

  return {
    s_lit_raw,
    s_dig_raw,
    s_total_raw,
    s_lit: roundTo2(s_lit_raw),
    s_dig: roundTo2(s_dig_raw),
    s_total: roundTo2(s_total_raw),
    category,
  };
}

/**
 * Calcula las puntuaciones para una sesión completa.
 * Si la sesión está incompleta (no cuenta con los 9 ítems de evaluación: 2 R1 + 2 R2 + 2 R3 + 3 R4),
 * no se puntúa y retorna undefined.
 */
export function calculateSessionScores(
  answers: AnswerRecord[],
  thresholds: ScoringThresholds = defaultScoringThresholds
): ScoresRecord | undefined {
  if (!answers || answers.length < 9) {
    return undefined;
  }

  // Identificar los ítems por prefijo
  const r1Correct = answers.filter((a) => a.item_id.startsWith('R1_') && a.correct).length;
  const r2Correct = answers.filter((a) => a.item_id.startsWith('R2_') && a.correct).length;
  const r3Correct = answers.filter((a) => a.item_id.startsWith('R3_') && a.correct).length;
  const r4Correct = answers.filter((a) => a.item_id.startsWith('R4_') && a.correct).length;

  const litCorrect = r1Correct + r2Correct; // De 4
  const iconsCorrect = r3Correct; // De 2
  const cardsCorrect = r4Correct; // De 3

  const result = calculateScores(litCorrect, iconsCorrect, cardsCorrect, thresholds);

  return {
    s_lit: result.s_lit,
    s_dig: result.s_dig,
    s_total: result.s_total,
    category: result.category,
  };
}
