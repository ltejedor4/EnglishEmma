import type { Topic } from '../content/types.ts';

/**
 * Imágenes ya optimizadas en src/assets/images (buddy-hello.webp, puzzle-animals.webp…).
 * Mientras no existan, el juego usa emojis, así que se pueden ir agregando de a poco.
 */
const files = import.meta.glob('../assets/images/*.webp', { eager: true, import: 'default' }) as Record<string, string>;

export function image(name: string): string | undefined {
  return files[`../assets/images/${name}.webp`];
}

/** Imagen del rompecabezas del tema, o una provisional hecha con sus emojis (una palabra por ficha). */
export function puzzleImage(topic: Topic, cols: number, rows: number): string {
  const real = image(`puzzle-${topic.id}`);
  if (real) return real;

  const w = 1536;
  const h = 1024;
  const cells = topic.words.slice(0, cols * rows);
  const emojis = cells
    .map((word, i) => {
      const x = ((i % cols) + 0.5) * (w / cols);
      const y = (Math.floor(i / cols) + 0.5) * (h / rows);
      return `<text x="${x}" y="${y}" font-size="260" text-anchor="middle" dominant-baseline="central">${word.image}</text>`;
    })
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffd6a5"/><stop offset="0.5" stop-color="#fdffb6"/><stop offset="1" stop-color="#a0c4ff"/>
    </linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>${emojis}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
