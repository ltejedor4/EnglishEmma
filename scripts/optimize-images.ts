/**
 * Convierte las imágenes de ChatGPT (assets/images-src/*.png) a WebP livianas en src/assets/images/.
 * El juego las usa automáticamente en cuanto existen (ver src/lib/images.ts).
 *
 *   npm run images
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import ffmpeg from 'ffmpeg-static';

const ROOT = join(import.meta.dirname, '..');
const SRC = join(ROOT, 'assets', 'images-src');
const OUT = join(ROOT, 'src', 'assets', 'images');

/** Lado mayor máximo según el tipo de imagen: los fondos y rompecabezas se ven grandes, Buddy no tanto. */
const maxSize = (name: string) => (name.startsWith('buddy-') ? 640 : 1600);

mkdirSync(OUT, { recursive: true });
// Las hojas de referencia (buddy-reference.png) solo sirven para pedir las demás imágenes; no van al juego.
// El ícono va aparte: se convierte en los íconos PNG de la PWA (ver más abajo).
const files = existsSync(SRC)
  ? readdirSync(SRC).filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && !f.includes('-reference') && !f.startsWith('icon.'))
  : [];
if (!files.length) console.log(`No hay imágenes en ${SRC}`);

for (const file of files) {
  const name = basename(file, extname(file));
  const input = join(SRC, file);
  const output = join(OUT, `${name}.webp`);
  if (existsSync(output) && statSync(output).mtimeMs > statSync(input).mtimeMs) continue;

  const size = maxSize(name);
  execFileSync(ffmpeg as unknown as string, [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', input,
    '-vf', `scale='min(${size},iw)':'min(${size},ih)':force_original_aspect_ratio=decrease`,
    // yuva420p conserva la transparencia de Buddy.
    '-c:v', 'libwebp', '-quality', '82', '-pix_fmt', 'yuva420p', output,
  ]);
  const kb = (bytes: number) => `${Math.round(bytes / 1024)} KB`;
  console.log(`${file} (${kb(statSync(input).size)}) → ${name}.webp (${kb(statSync(output).size)})`);
}

/** Íconos de la PWA a partir de assets/images-src/icon.png (Buddy sobre fondo de color). */
const ICON = join(SRC, 'icon.png');
const ICONS_OUT = join(ROOT, 'public', 'icons');
if (existsSync(ICON)) {
  const run = (args: string[]) => execFileSync(ffmpeg as unknown as string, ['-hide_banner', '-loglevel', 'error', '-y', ...args]);
  for (const [name, size] of [['icon-512', 512], ['icon-192', 192], ['apple-touch-icon', 180]] as const) {
    run(['-i', ICON, '-vf', `scale=${size}:${size}:flags=lanczos`, join(ICONS_OUT, `${name}.png`)]);
  }
  // Android recorta los íconos "maskable" en círculo: Buddy al 72 % con margen del color de fondo del ícono.
  const corner = execFileSync(ffmpeg as unknown as string, [
    '-hide_banner', '-loglevel', 'error', '-i', ICON, '-vf', 'crop=1:1:4:4', '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1',
  ]);
  const color = `0x${corner.toString('hex')}`;
  run(['-i', ICON, '-vf', `scale=368:368:flags=lanczos,pad=512:512:72:72:color=${color}`, join(ICONS_OUT, 'icon-maskable-512.png')]);
  console.log(`icon.png → íconos de la PWA en public/icons (fondo ${color})`);
}
