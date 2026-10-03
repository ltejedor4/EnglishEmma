import { Howl } from 'howler';

const cache = new Map<string, Howl>();

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

/** Reproduce un clip y resuelve cuando termina (o si falla, para no bloquear el juego). */
export function play(key: string): Promise<void> {
  return new Promise((resolve) => {
    const howl = load(key);
    howl.once('end', () => resolve());
    howl.once('loaderror', () => resolve());
    howl.once('playerror', () => resolve());
    howl.play();
  });
}

/** Reproduce varios clips seguidos: play(['common/look-here-it-is', 'animals/dog']). */
export async function playSequence(keys: string[]) {
  for (const key of keys) await play(key);
}
