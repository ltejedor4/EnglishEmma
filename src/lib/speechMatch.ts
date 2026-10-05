import type { Word } from '../content/types.ts';

/**
 * ¿Lo que entendió el reconocedor se parece a la palabra? A propósito muy generoso: es una niña de 5
 * años, hispanohablante, y el reconocedor está entrenado con adultos. Mejor celebrar de más que de menos.
 */

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Aproxima cómo suena con acento hispano: "jelou" y "yellow" quedan parecidos. */
function accentKey(text: string): string {
  return text
    .replace(/sh/g, 'ch')
    .replace(/ph/g, 'f')
    .replace(/j/g, 'y')
    .replace(/v/g, 'b')
    .replace(/z/g, 's')
    .replace(/ll/g, 'y')
    .replace(/w/g, 'u')
    .replace(/^es(?=[^aeiou])/, 's') // "eschool" → "school"
    .replace(/h/g, '')
    .replace(/(.)\1+/g, '$1');
}

function levenshtein(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

const similarity = (a: string, b: string) => 1 - levenshtein(a, b) / Math.max(a.length, b.length, 1);

/** Umbral de parecido (0–1). Bajo a propósito. */
export const MIN_SIMILARITY = 0.5;

export function matchSpoken(word: Word, alternatives: string[]): boolean {
  const target = normalize(word.say);
  const accepted = [target, ...(word.sounds ?? []).map(normalize)];
  const size = target.split(' ').length;

  for (const alt of alternatives.map(normalize)) {
    if (!alt) continue;
    const tokens = alt.split(' ');
    // Pedazos del mismo largo que la palabra ("teddy bear" → de a dos), más la frase entera.
    const chunks = new Set([alt, alt.replace(/ /g, '')]);
    for (let i = 0; i + size <= tokens.length; i++) chunks.add(tokens.slice(i, i + size).join(' '));

    for (const chunk of chunks) {
      for (const ok of accepted) {
        if (chunk === ok || chunk.replace(/ /g, '') === ok.replace(/ /g, '')) return true;
        if (similarity(chunk, ok) >= MIN_SIMILARITY) return true;
        if (similarity(accentKey(chunk), accentKey(ok)) >= MIN_SIMILARITY) return true;
      }
    }
  }
  return false;
}
