/** Tono con el que Buddy dice la frase. El script lo traduce a una etiqueta de ElevenLabs. */
export type Mood = 'cheerful' | 'calm' | 'sleepy';

export interface Word {
  id: string;
  /** Emoji por ahora; luego puede ser una ruta a una ilustración. */
  image: string;
  /** La palabra sola, como se pronuncia: "Dog." */
  say: string;
  /** Pregunta para Listen & Touch / Find it in the scene: "Where is the dog?" */
  ask: string;
  /** Frases de contexto para la presentación y las escenas. */
  facts: string[];
  /**
   * Lo que el reconocedor de voz suele entender cuando la dice (homófonos, acento):
   * "Your turn! Say it!" también las acepta. Ej.: two → ['to', 'too'].
   */
  sounds?: string[];
  /** Cómo dibujar su tarjeta, si la descripción por defecto del tema no alcanza (scripts/generate-images.ts). */
  picture?: string;
}

export interface Topic {
  id: string;
  title: string;
  /** Cómo Buddy anuncia el tema: "Animals!" */
  sayTitle: string;
  icon: string;
  words: Word[];
  /** Frases para papá/mamá en la zona de padres (solo texto, no se genera audio). */
  homeMission: string[];
  /** Preguntas para conversar en "Your turn! Say it!" (ej. "What's your name?"). */
  questions?: Question[];
}

/** Qué respuesta se acepta (siempre generoso). */
export type Accepts =
  /** Que diga alguna de estas palabras (o algo parecido): ['emma'] */
  | { kind: 'words'; words: string[] }
  /** Cualquier número (en palabras o cifras): "How old are you?" */
  | { kind: 'number' }
  /** Cualquier palabra de un tema, más algunas extra: colores, emociones ("fine", "good"…) */
  | { kind: 'topic'; topicId: string; extra?: string[] }
  /** Sí o no */
  | { kind: 'yesno' };

export interface Question {
  id: string;
  /** Emoji de respaldo mientras no exista la ilustración q-<tema>-<id>.webp */
  image: string;
  /** Usar la ilustración de otra tarjeta (ej. 'word-food-apple' para "Do you like apples?"). */
  imageName?: string;
  /** Lo que pregunta Buddy: "What's your name?" */
  ask: string;
  /** La respuesta modelo que Buddy le enseña: "My name is Emma." */
  answer: string;
  accepts: Accepts;
  /** Cómo dibujar su ilustración (scripts/generate-images.ts). */
  picture?: string;
}

export interface Line {
  id: string;
  text: string;
  mood?: Mood;
}
