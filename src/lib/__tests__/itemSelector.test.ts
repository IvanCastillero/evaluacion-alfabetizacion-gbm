import { describe, it, expect } from 'vitest';
import { selectSessionItems } from '../itemSelector';
import itemsData from '../../content/items.json';

describe('Banco y selector de ítems (Criterio de Aceptación 2)', () => {
  it('Contiene exactamente los 18 ítems requeridos en items.json', () => {
    expect(itemsData.items.length).toBe(18);
    
    const r1 = itemsData.items.filter((i) => i.reto === 1);
    const r2 = itemsData.items.filter((i) => i.reto === 2);
    const r3 = itemsData.items.filter((i) => i.reto === 3);
    const r4 = itemsData.items.filter((i) => i.reto === 4);

    expect(r1.length).toBe(4);
    expect(r2.length).toBe(4);
    expect(r3.length).toBe(4);
    expect(r4.length).toBe(6);
  });

  it('Selecciona exactamente 2 + 2 + 2 + 3 ítems en cada sesión', () => {
    const sessionItems = selectSessionItems();
    expect(sessionItems.reto1.length).toBe(2);
    expect(sessionItems.reto2.length).toBe(2);
    expect(sessionItems.reto3.length).toBe(2);
    expect(sessionItems.reto4.length).toBe(3);
    expect(sessionItems.allSelected.length).toBe(9);
  });

  it('No duplica ítems dentro de una misma sesión', () => {
    const sessionItems = selectSessionItems();
    const ids = sessionItems.allSelected.map((i) => i.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(9);
  });

  it('Desordena las opciones conservando la respuesta correcta', () => {
    const sessionItems = selectSessionItems();
    sessionItems.reto1.forEach((item) => {
      const correctOption = item.options?.find((o) => o.id === item.correct);
      expect(correctOption).toBeDefined();
    });
  });
});
