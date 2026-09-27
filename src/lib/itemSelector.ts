import { QuestionItem } from '../types';
import itemsData from '../content/items.json';

const allItems = itemsData.items as QuestionItem[];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface SessionItems {
  reto1: QuestionItem[]; // 2 ítems
  reto2: QuestionItem[]; // 2 ítems
  reto3: QuestionItem[]; // 2 ítems
  reto4: QuestionItem[]; // 3 ítems
  allSelected: QuestionItem[]; // 9 ítems en orden
}

/**
 * Selecciona aleatoriamente 2 + 2 + 2 + 3 ítems del banco de 18 ítems,
 * y desordena las opciones de respuesta para cada sesión.
 */
export function selectSessionItems(): SessionItems {
  const r1Pool = allItems.filter((it) => it.reto === 1);
  const r2Pool = allItems.filter((it) => it.reto === 2);
  const r3Pool = allItems.filter((it) => it.reto === 3);
  const r4Pool = allItems.filter((it) => it.reto === 4);

  const selectedR1 = shuffle(r1Pool).slice(0, 2);
  const selectedR2 = shuffle(r2Pool).slice(0, 2);
  const selectedR3 = shuffle(r3Pool).slice(0, 2);
  const selectedR4 = shuffle(r4Pool).slice(0, 3);

  // Desordenar opciones de cada ítem
  const randomizeOptions = (item: QuestionItem): QuestionItem => {
    if (!item.options || item.options.length === 0) return item;
    return {
      ...item,
      options: shuffle(item.options),
    };
  };

  const finalR1 = selectedR1.map(randomizeOptions);
  const finalR2 = selectedR2.map(randomizeOptions);
  const finalR3 = selectedR3.map(randomizeOptions);
  const finalR4 = selectedR4; // R4 no tiene opciones dinámicas sino Riesgo/Seguro

  return {
    reto1: finalR1,
    reto2: finalR2,
    reto3: finalR3,
    reto4: finalR4,
    allSelected: [...finalR1, ...finalR2, ...finalR3, ...finalR4],
  };
}
