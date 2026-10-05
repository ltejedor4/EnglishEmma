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
}

export interface Line {
  id: string;
  text: string;
  mood?: Mood;
}
