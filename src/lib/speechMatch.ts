import type { Question, Topic, Word } from '../content/types.ts';

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

/** ¿Alguna alternativa contiene (algo parecido a) alguna de las expresiones aceptadas? */
function saysAnyOf(accepted: string[], alternatives: string[], minSimilarity = MIN_SIMILARITY): boolean {
  const oks = accepted.map(normalize).filter(Boolean);
  for (const alt of alternatives.map(normalize)) {
    if (!alt) continue;
    const tokens = alt.split(' ');
    for (const ok of oks) {
      // Pedazos del mismo largo que lo aceptado ("teddy bear" → de a dos), más la frase entera.
      const size = ok.split(' ').length;
      const chunks = new Set([alt, alt.replace(/ /g, '')]);
      for (let i = 0; i + size <= tokens.length; i++) chunks.add(tokens.slice(i, i + size).join(' '));
      for (const chunk of chunks) {
        if (chunk === ok || chunk.replace(/ /g, '') === ok.replace(/ /g, '')) return true;
        if (similarity(chunk, ok) >= minSimilarity) return true;
        if (similarity(accentKey(chunk), accentKey(ok)) >= minSimilarity) return true;
      }
    }
  }
  return false;
}

export function matchSpoken(word: Word, alternatives: string[]): boolean {
  return saysAnyOf([word.say, ...(word.sounds ?? [])], alternatives);
}

const NUMBER_WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const NUMBER_SOUNDS = ['won', 'to', 'too', 'for', 'ate', 'tree', 'sics', 'fai'];
const YES_NO = ['yes', 'yeah', 'yep', 'yup', 'no', 'nope', 'sure', 'of course', 'i do', 'i don t', 'si'];

/**
 * ¿Respondió la pregunta? Igual de generoso: para "How old are you?" vale cualquier número, para
 * "What's your favorite color?" cualquier color, para "Do you like…?" sí o no.
 */
export function matchAnswer(question: Question, alternatives: string[], topicsById: Record<string, Topic>): boolean {
  const accepts = question.accepts;
  switch (accepts.kind) {
    case 'words': {
      // Se quitan las palabras de la frase modelo ("my name is", "I am from") antes de comparar:
      // si no, "name" se parece a "ema" y "my name is Lucas" contaría como Emma.
      const keep = new Set(accepts.words.flatMap((w) => normalize(w).split(' ')));
      const frame = new Set(normalize(question.answer).split(' ').filter((t) => !keep.has(t)));
      const rest = alternatives.map((alt) => normalize(alt).split(' ').filter((t) => !frame.has(t)).join(' '));
      return saysAnyOf(accepts.words, rest);
    }
    case 'number':
      // Más estricto con las palabras (0.8) para que "fine" no cuente como "five".
      return alternatives.some((alt) => /\d/.test(alt)) || saysAnyOf([...NUMBER_WORDS, ...NUMBER_SOUNDS], alternatives, 0.8);
    case 'topic': {
      const words = topicsById[accepts.topicId]?.words.map((w) => w.say) ?? [];
      return saysAnyOf([...words, ...(accepts.extra ?? [])], alternatives);
    }
    case 'yesno':
      return saysAnyOf(YES_NO, alternatives, 0.67);
  }
}
