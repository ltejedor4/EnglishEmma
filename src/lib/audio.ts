import { Howl, Howler } from 'howler';
import { celebrations } from '../content/index.ts';

const cache = new Map<string, Howl>();
/** Cada stopAll() invalida las secuencias en curso, para que no sigan sonando al cambiar de pantalla. */
let generation = 0;

/** Ruta de un clip generado por scripts/generate-audio.ts, p. ej. "animals/dog-ask". */
function load(key: string): Howl {
  let howl = cache.get(key);
  if (!howl) {
    howl = new Howl({ src: [`${import.meta.env.BASE_URL}audio/${key}.mp3`] });
    cache.set(key, howl);
  }
  return howl;
}

export function preload(keys: string[]) {
  keys.forEach(load);
}

export function stopAll() {
  generation++;
  Howler.stop();
}

/** Reproduce un clip y resuelve cuando termina, se detiene o falla (para no bloquear el juego). */
function playOne(key: string): Promise<void> {
  return new Promise((resolve) => {
    const howl = load(key);
    const id = howl.play();
    const done = () => resolve();
    howl.once('end', done, id);
    howl.once('stop', done, id);
    howl.once('playerror', done, id);
    if (howl.state() !== 'loaded') howl.once('loaderror', done);
  });
}

/** Corta lo que esté sonando y reproduce los clips seguidos. Resuelve false si otra secuencia la interrumpió. */
export async function say(...keys: string[]): Promise<boolean> {
  stopAll();
  const mine = generation;
  for (const key of keys) {
    if (generation !== mine) return false;
    await playOne(key);
  }
  return generation === mine;
}

export const randomCelebration = () =>
  `common/${celebrations[Math.floor(Math.random() * celebrations.length)].id}`;
