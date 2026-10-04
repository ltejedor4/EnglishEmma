/** Tipo de juego que papá/mamá pueden elegir en la zona de padres. */
export type LessonMode = 'mix' | 'ask' | 'fact' | 'pair';

export const LESSON_MODES: { id: LessonMode; icon: string; label: string; hint: string }[] = [
  { id: 'mix', icon: '🎲', label: 'Mezcla', hint: 'Un poco de todo (recomendado)' },
  { id: 'ask', icon: '👆', label: 'Where is…?', hint: '"Where is the dog?" → tocar la imagen' },
  { id: 'fact', icon: '👂', label: 'Frases', hint: '"The sky is blue." → encontrar el azul' },
  { id: 'pair', icon: '✌️', label: 'Find these two!', hint: '"Red… and… blue" → tocar las dos' },
];
