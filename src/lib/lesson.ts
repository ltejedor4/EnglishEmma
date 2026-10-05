/** Tipo de juego que papá/mamá pueden elegir en la zona de padres. */
export type LessonMode = 'mix' | 'ask' | 'fact' | 'pair' | 'memory' | 'balloons' | 'feed' | 'speak';

export const LESSON_MODES: { id: LessonMode; icon: string; label: string; hint: string }[] = [
  { id: 'mix', icon: '🎲', label: 'Mezcla', hint: 'La lección completa: preguntas, dos juegos y hablar (recomendado)' },
  { id: 'ask', icon: '👆', label: 'Where is…?', hint: '"Where is the dog?" → tocar la imagen' },
  { id: 'fact', icon: '👂', label: 'Frases', hint: '"The sky is blue." → encontrar el azul' },
  { id: 'pair', icon: '✌️', label: 'Find these two!', hint: '"Red… and… blue" → tocar las dos' },
  { id: 'memory', icon: '🃏', label: 'Memory', hint: 'Cartas que dicen su palabra: encontrar los pares' },
  { id: 'balloons', icon: '🎈', label: 'Pop the Balloons', hint: '"Pop… red!" → reventar el globo' },
  { id: 'feed', icon: '🍎', label: 'Feed Buddy', hint: '"Give me… apple!" → arrastrar o tocar' },
  { id: 'speak', icon: '🎤', label: 'Your turn! Say it!', hint: 'Decir las palabras en voz alta' },
];
