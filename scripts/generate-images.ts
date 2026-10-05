/**
 * Pide a Codex CLI las imágenes que faltan, con el estilo del juego y la referencia correcta.
 *
 *   npm run images:missing                                  → lista lo que falta (tarjetas de palabras y poses de Buddy)
 *   npm run images:generate -- --missing                    → genera todo lo que falta
 *   npm run images:generate -- word-animals-horse           → genera una (o varias) por nombre
 *   npm run images:generate -- buddy-sad --prompt "sitting, sad, a single tear"   → con descripción propia
 *   npm run images:generate -- --missing --dry-run          → muestra los pedidos sin llamar a Codex
 *
 * Después: `npm run images` (convierte a WebP) y revisar las imágenes antes del commit.
 * Codex corre con `-s workspace-write` dentro del proyecto y se le pide tocar solo el archivo pedido;
 * el script verifica con git que no haya cambiado nada más.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { topics } from '../src/content/index.ts';
import type { Topic, Word } from '../src/content/types.ts';

const ROOT = join(import.meta.dirname, '..');
const SRC = join(ROOT, 'assets', 'images-src');

const STYLE =
  "Style: children's picture book illustration for a 5-year-old, same style as the attached reference: " +
  'soft rounded shapes, thick smooth dark-brown outlines, flat colors with gentle soft shading, warm cheerful ' +
  'pastel palette with clear saturated main colors. Friendly and cute, never scary. ' +
  'Absolutely no text, letters, numbers, digits or logos anywhere in the image.';
const SQUARE_TRANSPARENT =
  'Square 1024x1024 canvas, the subject centered and filling about 80% of it, transparent background (PNG with alpha), no ground shadow, nothing else.';
const BUDDY_REF = 'buddy-reference.png';
const BUDDY = 'Buddy the puppy from the attached character reference, exactly as designed (cream fur, light-brown patch around one eye, floppy ears, blue collar with a round yellow star tag)';

interface Spec {
  name: string;
  prompt: string;
  refs: string[];
}

/** Cómo se dibuja la tarjeta de una palabra, según el tema (como en docs/IMAGENES-2.md). */
function wordSpec(topic: Topic, word: Word): Spec {
  const name = `word-${topic.id}-${word.id}`;
  const label = word.say.replace(/[.!?]$/, '').toLowerCase();
  const picture = word.picture;
  const puzzle = existsSync(join(SRC, `puzzle-${topic.id}.png`)) ? [`puzzle-${topic.id}.png`] : [];
  switch (topic.id) {
    case 'colors':
      return { name, refs: [BUDDY_REF], prompt: `A big cute paint splash in pure bright ${label}, with a tiny happy face. ${picture ?? ''}` };
    case 'numbers': {
      const n = topic.words.indexOf(word) + 1;
      return {
        name,
        refs: [BUDDY_REF],
        prompt: `Exactly ${n} cute smiling yellow stars, all the same size, neatly arranged and well separated so they are easy to count. Count carefully: exactly ${n}.`,
      };
    }
    case 'actions':
      return { name, refs: [BUDDY_REF], prompt: `${BUDDY}, ${picture ?? `doing the action "${label}" in a clear, easy to recognize way`}.` };
    case 'feelings':
      return { name, refs: [BUDDY_REF], prompt: `The head of ${BUDDY}, ${picture ?? `clearly feeling ${label}, with a big expressive face`}.` };
    case 'family':
      return {
        name,
        refs: puzzle.length ? puzzle : [BUDDY_REF],
        prompt: `Portrait, waist up, smiling, of the ${picture ?? label} from the attached family scene (same character, same clothes and colors).`,
      };
    default:
      return {
        name,
        refs: puzzle.length ? puzzle : [BUDDY_REF],
        prompt: `A single ${picture ?? label}${puzzle.length ? ', drawn exactly like the matching object in the attached scene (same shape and colors)' : ''}, seen from the front.`,
      };
  }
}

/** Poses de Buddy declaradas en src/lib/pose.ts. */
function poses(): string[] {
  const text = readFileSync(join(ROOT, 'src', 'lib', 'pose.ts'), 'utf8');
  return [...text.matchAll(/'([a-z]+)'/g)].map((m) => m[1]);
}

function allSpecs(): Spec[] {
  const words = topics.flatMap((topic) => topic.words.map((word) => wordSpec(topic, word)));
  const buddy = poses().map((pose) => ({ name: `buddy-${pose}`, refs: [BUDDY_REF], prompt: `${BUDDY}, full body, pose: ${pose}.` }));
  return [...words, ...buddy];
}

const exists = (name: string) => existsSync(join(SRC, `${name}.png`));

function codexBin(): string {
  if (process.env.CODEX_BIN) return process.env.CODEX_BIN;
  const which = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['codex'], { encoding: 'utf8' });
  if (which.status === 0) return which.stdout.split(/\r?\n/)[0].trim();
  const windowsDefault = join(process.env.LOCALAPPDATA ?? '', 'Programs', 'OpenAI', 'Codex', 'bin', 'codex.exe');
  if (existsSync(windowsDefault)) return windowsDefault;
  throw new Error('No encuentro Codex CLI: instálalo o define CODEX_BIN.');
}

const gitStatus = () => execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' });

function generate(spec: Spec, dryRun: boolean) {
  const target = `assets/images-src/${spec.name}.png`;
  const instructions = [
    `Generate ONE image with your image generation tool and save it as a PNG file at ${target} (overwrite if it exists).`,
    'Do not create, modify or delete any other file in this repository.',
    '',
    `Image: ${spec.prompt} ${SQUARE_TRANSPARENT}`,
    '',
    STYLE,
    '',
    'When done, reply with only the saved file path.',
  ].join('\n');
  const args = ['exec', '-C', ROOT, '-s', 'workspace-write', '--ephemeral', '--color', 'never'];
  for (const ref of spec.refs) args.push('-i', `assets/images-src/${ref}`);
  if (dryRun) {
    console.log(`\n── ${spec.name}  (referencias: ${spec.refs.join(', ')})\n${instructions}`);
    return true;
  }
  console.log(`→ ${spec.name}…`);
  const before = gitStatus();
  const run = spawnSync(codexBin(), [...args, instructions], { cwd: ROOT, encoding: 'utf8', timeout: 10 * 60_000 });
  const ok = run.status === 0 && exists(spec.name);
  const unexpected = gitStatus()
    .split('\n')
    .filter((line) => line && !before.includes(line) && !line.endsWith(`${spec.name}.png`));
  if (unexpected.length) console.warn(`  ⚠️ Codex tocó otros archivos, revisar:\n  ${unexpected.join('\n  ')}`);
  console.log(ok ? `  ✓ ${target}` : `  ✗ no se generó (${run.stderr?.trim().split('\n').at(-1) ?? 'sin detalle'})`);
  return ok;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const promptIndex = args.indexOf('--prompt');
  const customPrompt = promptIndex >= 0 ? args[promptIndex + 1] : undefined;
  const names = args.filter((a, i) => !a.startsWith('--') && (promptIndex < 0 || i !== promptIndex + 1));
  const specs = allSpecs();
  if (customPrompt && names.length !== 1) throw new Error('--prompt describe una sola imagen: pasa un solo nombre.');

  if (args.includes('--list')) {
    const missing = specs.filter((s) => !exists(s.name));
    console.log(missing.length ? `Faltan ${missing.length}:\n  ${missing.map((s) => s.name).join('\n  ')}` : 'No falta ninguna imagen.');
    return;
  }

  const chosen = args.includes('--missing')
    ? specs.filter((s) => !exists(s.name))
    : names.map((name) => {
        const known = specs.find((s) => s.name === name);
        if (customPrompt) return { name, refs: known?.refs ?? [BUDDY_REF], prompt: name.startsWith('buddy-') ? `${BUDDY}, full body, ${customPrompt}.` : customPrompt };
        if (!known) throw new Error(`No sé cómo dibujar "${name}": pasa --prompt "descripción".`);
        return known;
      });
  if (!chosen.length) return console.log('Nada que generar.');
  const failed = chosen.filter((spec) => !generate(spec, dryRun));
  if (!dryRun) console.log(failed.length ? `\nFallaron: ${failed.map((s) => s.name).join(', ')}` : '\nListo. Ahora: npm run images (y revisarlas).');
}

main();
