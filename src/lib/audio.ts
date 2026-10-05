import { Howl, Howler } from 'howler';
import { celebrations, gentleRetry, greetings, instructions, session, speaking } from '../content/index.ts';

const cache = new Map<string, Howl>();
/** Cada stopAll() invalida las secuencias en curso, para que no sigan sonando al cambiar de pantalla. */
let generation = 0;
/** Sonidos pedidos y aún no terminados, incluidos los que esperan a que su archivo cargue. */
const active = new Set<{ howl: Howl; id: number }>();

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

// Las frases de Buddy que suenan en cualquier sesión, listas desde el principio.
preload([...greetings, ...celebrations, ...gentleRetry, ...instructions, ...session, ...speaking].map((line) => `common/${line.id}`));

export function stopAll() {
  generation++;
  for (const sound of active) sound.howl.stop(sound.id);
  active.clear();
  Howler.stop();
}

/** Reproduce un clip y resuelve cuando termina, se detiene o falla (para no bloquear el juego). */
function playOne(key: string, mine: number): Promise<void> {
  return new Promise((resolve) => {
    const howl = load(key);
    const id = howl.play();
    const sound = { howl, id };
    active.add(sound);
    const done = () => {
      active.delete(sound);
      resolve();
    };
    // Si mientras cargaba el archivo se pidió otra cosa, este sonido ya no tiene que sonar.
    howl.once('play', () => generation !== mine && howl.stop(id), id);
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
    await playOne(key, mine);
  }
  return generation === mine;
}

export const randomCelebration = () =>
  `common/${celebrations[Math.floor(Math.random() * celebrations.length)].id}`;
