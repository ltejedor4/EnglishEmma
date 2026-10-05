/**
 * Micrófono para "Your turn! Say it!".
 * - Reconocimiento de voz del navegador (Chrome en Android; Safari en iPad). Necesita internet y, en
 *   Chrome, el audio se procesa en los servidores de Google.
 * - Respaldo: grabar unos segundos y reproducirlos ("Listen to you!"). Funciona sin internet y la voz
 *   no sale del dispositivo.
 */

/** Modo elegido en la zona de padres. */
export type SpeechMode = 'auto' | 'record' | 'off';

interface RecognitionResultList {
  length: number;
  [i: number]: { length: number; [j: number]: { transcript: string } };
}
interface Recognition {
  lang: string;
  maxAlternatives: number;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: RecognitionResultList }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | undefined {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/** ¿Se puede usar el reconocimiento ahora? (existe y hay internet) */
export const canRecognize = () => !!recognitionCtor() && navigator.onLine;

/** ¿Se puede grabar y reproducir? */
export const canRecord = () => !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

export type ListenResult = { alternatives: string[] } | { error: string };

/** Errores que significan "el reconocimiento no va a funcionar aquí": pasar al respaldo. */
export const FATAL_ERRORS = ['not-allowed', 'service-not-allowed', 'audio-capture', 'network', 'language-not-supported', 'start-failed'];

/** Escucha una frase corta en inglés y devuelve lo que entendió (hasta 5 alternativas). */
export function listenOnce(timeoutMs = 5000): Promise<ListenResult> {
  const Ctor = recognitionCtor();
  if (!Ctor) return Promise.resolve({ error: 'unsupported' });
  const rec = new Ctor();
  rec.lang = 'en-US';
  rec.maxAlternatives = 5;
  rec.interimResults = false;
  rec.continuous = false;

  return new Promise((resolve) => {
    let done = false;
    const finish = (result: ListenResult) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try {
        rec.abort();
      } catch {
        // ya terminó
      }
      resolve(result);
    };
    rec.onresult = (e) => {
      const first = e.results[0];
      const alternatives: string[] = [];
      for (let i = 0; first && i < first.length; i++) alternatives.push(first[i].transcript);
      finish({ alternatives });
    };
    rec.onerror = (e) => finish(e.error === 'no-speech' || e.error === 'aborted' ? { alternatives: [] } : { error: e.error });
    rec.onend = () => finish({ alternatives: [] });
    const timer = setTimeout(() => finish({ alternatives: [] }), timeoutMs);
    try {
      rec.start();
    } catch {
      finish({ error: 'start-failed' });
    }
  });
}

/** Graba unos segundos del micrófono. Devuelve la grabación o un error (permiso denegado, sin micrófono). */
export async function recordClip(ms = 3000): Promise<{ blob: Blob } | { error: string }> {
  if (!canRecord()) return { error: 'unsupported' };
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    return { error: (err as DOMException)?.name === 'NotAllowedError' ? 'not-allowed' : 'audio-capture' };
  }
  return new Promise((resolve) => {
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      resolve({ blob: new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }) });
    };
    recorder.start();
    setTimeout(() => recorder.state !== 'inactive' && recorder.stop(), ms);
  });
}

/** Reproduce una grabación y resuelve al terminar. */
export function playClip(blob: Blob): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    const done = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onended = done;
    audio.onerror = done;
    audio.play().catch(done);
  });
}
