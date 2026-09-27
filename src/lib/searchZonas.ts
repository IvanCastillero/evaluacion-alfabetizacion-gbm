import { Zone } from '../types';
import zonasData from '../content/zonas.json';

const allZonas: Zone[] = zonasData.zonas;

export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Calcula la distancia de Levenshtein clásica entre dos cadenas.
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = [];

  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // eliminación
        dp[i][j - 1] + 1, // inserción
        dp[i - 1][j - 1] + cost // sustitución
      );
    }
  }

  return dp[m][n];
}

/**
 * Comprueba si la consulta coincide con una ventana o palabra dentro del objetivo
 * con una tolerancia máxima de 1 error (sustitución, omisión o inserción).
 */
export function fuzzyMatchWord(query: string, targetWord: string): boolean {
  if (Math.abs(query.length - targetWord.length) <= 1) {
    if (levenshteinDistance(query, targetWord) <= 1) {
      return true;
    }
  }

  // Si la palabra es más larga, comprobar si el prefijo tiene distancia <= 1
  if (targetWord.length >= query.length) {
    const prefix = targetWord.slice(0, query.length);
    if (levenshteinDistance(query, prefix) <= 1) {
      return true;
    }
    // O si query tiene una letra menos
    if (query.length > 2) {
      const prefixMinusOne = targetWord.slice(0, query.length - 1);
      if (levenshteinDistance(query, prefixMinusOne) <= 1) {
        return true;
      }
    }
  }

  return false;
}

export interface SearchMatch {
  zone: Zone;
  score: number; // Menor score = mejor coincidencia
}

/**
 * Busca corregimientos a partir de la 2.ª letra.
 * Ignora tildes y mayúsculas, y tolera al menos un error tipográfico (p. ej. "tokumen" -> "Tocumen").
 * Retorna un máximo de 5 resultados ordenados por relevancia.
 */
export function searchZonas(query: string, zonas: Zone[] = allZonas): Zone[] {
  const normQuery = normalizeText(query);
  if (normQuery.length < 2) {
    return [];
  }

  const matches: SearchMatch[] = [];

  for (const zone of zonas) {
    const normTarget = normalizeText(zone.name);
    const targetWords = normTarget.split(/\s+/);

    // 1. Coincidencia exacta o prefijo idéntico
    if (normTarget === normQuery) {
      matches.push({ zone, score: 0 });
      continue;
    }

    if (normTarget.startsWith(normQuery)) {
      matches.push({ zone, score: 1 });
      continue;
    }

    // Prefijo de alguna palabra (ej. "diciembre" en "24 de diciembre")
    const wordPrefix = targetWords.some((w) => w.startsWith(normQuery));
    if (wordPrefix) {
      matches.push({ zone, score: 2 });
      continue;
    }

    // Subcadena en cualquier lugar
    if (normTarget.includes(normQuery)) {
      matches.push({ zone, score: 3 });
      continue;
    }

    // 2. Distancia Levenshtein en el nombre completo (tolera 1 error)
    if (Math.abs(normQuery.length - normTarget.length) <= 1) {
      const dist = levenshteinDistance(normQuery, normTarget);
      if (dist <= 1) {
        matches.push({ zone, score: 4 });
        continue;
      }
    }

    // 3. Distancia Levenshtein en palabras individuales o prefijos
    let matchedFuzzy = false;
    for (const word of targetWords) {
      if (fuzzyMatchWord(normQuery, word)) {
        matches.push({ zone, score: 5 });
        matchedFuzzy = true;
        break;
      }
    }

    // 4. Ventana deslizante para nombres compuestos (ej: "tokumen")
    if (!matchedFuzzy && normTarget.length >= normQuery.length) {
      for (let i = 0; i <= normTarget.length - normQuery.length; i++) {
        const windowSlice = normTarget.slice(i, i + normQuery.length);
        if (levenshteinDistance(normQuery, windowSlice) <= 1) {
          matches.push({ zone, score: 6 });
          break;
        }
      }
    }
  }

  // Ordenar por score ascendente y limitar a máximo 5 resultados
  matches.sort((a, b) => a.score - b.score);
  return matches.slice(0, 5).map((m) => m.zone);
}
