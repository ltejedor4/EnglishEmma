/**
 * Saca a Buddy de frente de la hoja de referencia (assets/images-src/buddy-reference.png)
 * y le quita el fondo blanco → assets/images-src/buddy.png.
 * Es el Buddy provisional para todas las poses hasta que lleguen las ilustraciones de cada una.
 *
 *   npm run buddy && npm run images
 */
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import ffmpeg from 'ffmpeg-static';

const ROOT = join(import.meta.dirname, '..');
const INPUT = join(ROOT, 'assets', 'images-src', 'buddy-reference.png');
const OUTPUT = join(ROOT, 'assets', 'images-src', 'buddy.png');
const FF = ffmpeg as unknown as string;

// ffmpeg -i sin salida termina con error, pero imprime el tamaño de la imagen.
const info = (() => {
  try {
    execFileSync(FF, ['-hide_banner', '-i', INPUT], { stdio: 'pipe' });
  } catch (err) {
    return String((err as { stderr: Buffer }).stderr);
  }
  return '';
})();
const [, w, h] = info.match(/, (\d+)x(\d+)/)!.map(Number);

const rgba = execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-i', INPUT, '-f', 'rawvideo', '-pix_fmt', 'rgba', 'pipe:1'], {
  maxBuffer: w * h * 4 + 1024,
});

const at = (x: number, y: number) => (y * w + x) * 4;
// Fondo = blanco o gris claro sin color (incluye la sombra del piso); el pelaje crema tiene color, así que no entra.
const isBackground = (i: number) => {
  const min = Math.min(rgba[i], rgba[i + 1], rgba[i + 2]);
  const max = Math.max(rgba[i], rgba[i + 1], rgba[i + 2]);
  return min > 205 && max - min < 20;
};

// 1. Relleno desde los bordes: solo el blanco conectado con el exterior es fondo.
//    El contorno marrón grueso protege los blancos de adentro (brillos de los ojos).
const removed = new Uint8Array(w * h);
const stack: number[] = [];
for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
while (stack.length) {
  const p = stack.pop()!;
  if (removed[p] || !isBackground(p * 4)) continue;
  removed[p] = 1;
  const x = p % w;
  if (x > 0) stack.push(p - 1);
  if (x < w - 1) stack.push(p + 1);
  if (p >= w) stack.push(p - w);
  if (p < w * (h - 1)) stack.push(p + w);
}

// 1b. Huecos blancos encerrados en la parte baja (entre las patas). Los brillos de los ojos están arriba y no se tocan.
const seen = new Uint8Array(w * h);
for (let start = Math.floor(h * 0.6) * w; start < w * h; start++) {
  if (removed[start] || seen[start] || !isBackground(start * 4)) continue;
  const region: number[] = [];
  const queue = [start];
  seen[start] = 1;
  while (queue.length) {
    const p = queue.pop()!;
    region.push(p);
    const x = p % w;
    for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p - w, p + w]) {
      if (q >= 0 && q < w * h && !seen[q] && !removed[q] && isBackground(q * 4)) {
        seen[q] = 1;
        queue.push(q);
      }
    }
  }
  if (region.length > 150) for (const p of region) removed[p] = 1;
}

// 2. Transparencia: fondo fuera, y borde suave para que no quede un halo blanco sobre el fondo oscuro.
for (let p = 0; p < w * h; p++) {
  const i = p * 4;
  if (removed[p]) {
    rgba[i + 3] = 0;
    continue;
  }
  const x = p % w;
  const nearBackground =
    (x > 0 && removed[p - 1]) || (x < w - 1 && removed[p + 1]) || (p >= w && removed[p - w]) || (p < w * (h - 1) && removed[p + w]);
  if (nearBackground) {
    const lightness = Math.min(rgba[i], rgba[i + 1], rgba[i + 2]);
    rgba[i + 3] = Math.max(0, Math.min(255, (255 - lightness) * 3));
  }
}

// 3. La primera figura de izquierda a derecha es la vista de frente: columnas con algo opaco.
const opaqueColumn = (x: number) => {
  for (let y = 0; y < h; y++) if (rgba[at(x, y) + 3] > 0) return true;
  return false;
};
let left = 0;
while (!opaqueColumn(left)) left++;
let right = left;
while (opaqueColumn(right + 1)) right++;
let top = 0;
let bottom = h - 1;
const opaqueRow = (y: number) => {
  for (let x = left; x <= right; x++) if (rgba[at(x, y) + 3] > 0) return true;
  return false;
};
while (!opaqueRow(top)) top++;
while (!opaqueRow(bottom)) bottom--;

// Borrar todo lo que no sea esta figura (las otras vistas entrarían en el recorte cuadrado).
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) if (x < left || x > right) rgba[at(x, y) + 3] = 0;
}

// 4. Recorte cuadrado con un poco de margen, centrado.
const side = (Math.ceil(Math.max(right - left, bottom - top) / 2) + 12) * 2;
const cx = Math.round((left + right) / 2);
const cy = Math.round((top + bottom) / 2);
execFileSync(
  FF,
  [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${w}x${h}`, '-i', 'pipe:0',
    '-vf', `pad=${w + side}:${h + side}:${side / 2}:${side / 2}:color=0x00000000,crop=${side}:${side}:${cx}:${cy}`,
    '-pix_fmt', 'rgba', OUTPUT,
  ],
  { input: rgba },
);
console.log(`Buddy de frente: columnas ${left}–${right}, filas ${top}–${bottom} → ${OUTPUT}`);
