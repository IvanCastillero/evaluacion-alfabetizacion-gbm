import { describe, it, expect } from 'vitest';
import { searchZonas, normalizeText, levenshteinDistance } from '../searchZonas';

describe('Buscador de Residencia P7 (Criterio de Aceptación 5)', () => {
  it('Normaliza tildes y mayúsculas correctamente', () => {
    expect(normalizeText('Tocúmen')).toBe('tocumen');
    expect(normalizeText('Curundú')).toBe('curundu');
    expect(normalizeText('SAN FRANCISCO')).toBe('san francisco');
  });

  it('Calcula la distancia de Levenshtein', () => {
    expect(levenshteinDistance('tocumen', 'tokumen')).toBe(1);
    expect(levenshteinDistance('ancon', 'ancon')).toBe(0);
    expect(levenshteinDistance('ancon', 'ancom')).toBe(1);
  });

  it('No retorna resultados con menos de 2 caracteres', () => {
    expect(searchZonas('')).toEqual([]);
    expect(searchZonas('t')).toEqual([]);
    expect(searchZonas('   T   ')).toEqual([]);
  });

  // CRITERIO DE ACEPTACIÓN 5:
  // "El buscador encuentra 'Tocumen' con 'toc', 'TOC', 'tokumen' y 'Tocúmen'."
  it('Criterio 5: Encuentra "Tocumen" con "toc"', () => {
    const results = searchZonas('toc');
    const names = results.map((r) => r.name);
    expect(names).toContain('Tocumen');
  });

  it('Criterio 5: Encuentra "Tocumen" con "TOC"', () => {
    const results = searchZonas('TOC');
    const names = results.map((r) => r.name);
    expect(names).toContain('Tocumen');
  });

  it('Criterio 5: Encuentra "Tocumen" con "tokumen" (tolerancia a 1 error)', () => {
    const results = searchZonas('tokumen');
    const names = results.map((r) => r.name);
    expect(names).toContain('Tocumen');
  });

  it('Criterio 5: Encuentra "Tocumen" con "Tocúmen" (tolerancia a tildes)', () => {
    const results = searchZonas('Tocúmen');
    const names = results.map((r) => r.name);
    expect(names).toContain('Tocumen');
  });

  it('Encuentra Curundú con "curundu", "kurundu" y "Curundú"', () => {
    expect(searchZonas('curundu').map((r) => r.name)).toContain('Curundú');
    expect(searchZonas('kurundu').map((r) => r.name)).toContain('Curundú');
    expect(searchZonas('Curundú').map((r) => r.name)).toContain('Curundú');
  });

  it('Retorna como máximo 5 resultados', () => {
    const results = searchZonas('an'); // Puede coincidir con Ancón, Santa Ana, etc.
    expect(results.length).toBeLessThanOrEqual(5);
  });
});
