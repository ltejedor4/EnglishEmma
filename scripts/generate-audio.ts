/**
 * Genera los audios de Buddy con ElevenLabs a partir de src/content.
 *
 *   npm run audio:dry                        → lista lo que falta y cuántos caracteres costaría
 *   npm run audio -- --only animals/dog,common/great-job
 *   npm run audio -- --force family/sister   → regenera esos clips aunque ya existan
 *   npm run audio                            → genera todo lo que falta
 *
 * El audio original de ElevenLabs se guarda en assets/audio-raw/ (lo que cuesta créditos; se versiona)
 * y la versión procesada (sin silencios, volumen normalizado, mono 64 kbps) en public/audio/.
 * Un clip solo se vuelve a pedir si cambia su texto, la voz, el modelo o los ajustes.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import ffmpeg from 'ffmpeg-static';
import { topics, greetings, celebrations, gentleRetry, instructions, session } from '../src/content/index.ts';
import type { Mood } from '../src/content/types.ts';

const ROOT = join(import.meta.dirname, '..');
const RAW_DIR = join(ROOT, 'assets', 'audio-raw');
const OUT_DIR = join(ROOT, 'public', 'audio');
const MANIFEST = join(RAW_DIR, 'manifest.json');

process.loadEnvFile(join(ROOT, '.env'));
const API_KEY = process.env.ELEVENLABS_API_KEY ?? '';
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? '';
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_v4';

/** Ajustes de voz. Cambiarlos invalida la caché y regenera todo, así que con cuidado. */
const VOICE_SETTINGS = {};

const MOOD_TAGS: Record<Mood, string> = {
  cheerful: '[cheerfully] ',
  calm: '[calmly] ',
  // Cálido y tranquilo para la noche. [softly] sonaba a susurro y podía asustar.
  sleepy: '[warmly] ',
};

interface Clip {
  key: string; // "animals/dog-ask"
  text: string;
}

function collectClips(): Clip[] {
  const clips: Clip[] = [];
  for (const topic of topics) {
    clips.push({ key: `${topic.id}/title`, text: topic.sayTitle });
    for (const word of topic.words) {
      clips.push({ key: `${topic.id}/${word.id}`, text: word.say });
      clips.push({ key: `${topic.id}/${word.id}-ask`, text: word.ask });
      word.facts.forEach((fact, i) => clips.push({ key: `${topic.id}/${word.id}-fact-${i + 1}`, text: fact }));
    }
  }
  for (const line of [...greetings, ...celebrations, ...gentleRetry, ...instructions, ...session]) {
    clips.push({ key: `common/${line.id}`, text: (line.mood ? MOOD_TAGS[line.mood] : '') + line.text });
  }
  return clips;
}

function hashOf(clip: Clip): string {
  const payload = JSON.stringify([clip.text, VOICE_ID, MODEL_ID, VOICE_SETTINGS]);
  return createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const list = (flag: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1].split(',').map((s) => s.trim()) : [];
  };
  return { dryRun: args.includes('--dry-run'), only: list('--only'), force: list('--force') };
}

/** "animals/dog" coincide con animals/dog, animals/dog-ask, animals/dog-fact-1… y "animals" con todo el tema. */
const matches = (key: string, patterns: string[]) =>
  patterns.some((p) => key === p || key.startsWith(p + '-') || key.startsWith(p + '/'));

async function synthesize(text: string): Promise<Buffer> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ text, model_id: MODEL_ID, language_code: 'en', voice_settings: VOICE_SETTINGS }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Recorta silencios al inicio y al final, normaliza el volumen y comprime a mp3 mono. */
function processAudio(rawPath: string, outPath: string) {
  const trim = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05';
  const filters = [trim, 'areverse', trim, 'areverse', 'loudnorm=I=-16:TP=-1.5:LRA=11', 'apad=pad_dur=0.15'].join(',');
  execFileSync(ffmpeg as unknown as string, [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', rawPath,
    '-af', filters, '-ac', '1', '-ar', '44100', '-b:a', '64k', outPath,
  ]);
}

async function main() {
  const { dryRun, only, force } = parseArgs();
  const manifest: Record<string, { text: string; hash: string }> = existsSync(MANIFEST)
    ? JSON.parse(readFileSync(MANIFEST, 'utf8'))
    : {};

  const all = collectClips();
  const selected = only.length ? all.filter((c) => matches(c.key, only)) : all;
  const pending = selected.filter((c) => {
    if (matches(c.key, force)) return true;
    const raw = join(RAW_DIR, `${c.key}.mp3`);
    return !existsSync(raw) || manifest[c.key]?.hash !== hashOf(c);
  });

  const chars = pending.reduce((sum, c) => sum + c.text.length, 0);
  console.log(`Modelo ${MODEL_ID} · ${pending.length} de ${selected.length} clips por generar · ${chars} caracteres`);
  if (dryRun) {
    for (const c of pending) console.log(`  ${c.key.padEnd(32)} ${c.text}`);
    return;
  }
  if (!API_KEY || !VOICE_ID) throw new Error('Falta ELEVENLABS_API_KEY o ELEVENLABS_VOICE_ID en .env');

  for (const [i, clip] of pending.entries()) {
    const rawPath = join(RAW_DIR, `${clip.key}.mp3`);
    mkdirSync(dirname(rawPath), { recursive: true });
    writeFileSync(rawPath, await synthesize(clip.text));
    manifest[clip.key] = { text: clip.text, hash: hashOf(clip) };
    // Guardar el manifest tras cada clip: si algo falla a la mitad, no se pierde lo ya pagado.
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`  [${i + 1}/${pending.length}] ${clip.key}  "${clip.text}"`);
  }

  // Procesar siempre lo seleccionado (es gratis), por si cambiaron los filtros de ffmpeg.
  for (const clip of selected) {
    const rawPath = join(RAW_DIR, `${clip.key}.mp3`);
    if (!existsSync(rawPath)) continue;
    const outPath = join(OUT_DIR, `${clip.key}.mp3`);
    mkdirSync(dirname(outPath), { recursive: true });
    processAudio(rawPath, outPath);
  }
  writePreview(all.filter((c) => existsSync(join(OUT_DIR, `${c.key}.mp3`))));
  console.log('Listo. Escucha los clips en audio-preview.html');
}

/** Página simple para revisar todos los clips generados con su texto. */
function writePreview(clips: Clip[]) {
  const rows = clips
    .map((c) => `<tr><td>${c.key}</td><td>${c.text}</td><td><audio controls preload="none" src="public/audio/${c.key}.mp3"></audio></td></tr>`)
    .join('\n');
  const html = `<!doctype html><meta charset="utf-8"><title>Buddy audio preview</title>
<style>body{font-family:system-ui;margin:16px}td{padding:4px 12px;border-bottom:1px solid #ddd}</style>
<h1>Buddy · ${clips.length} clips</h1><table>${rows}</table>`;
  writeFileSync(join(ROOT, 'audio-preview.html'), html);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
