import { image } from '../lib/images.ts';
import type { WordRef } from '../lib/review.ts';

/** Ilustración de la palabra (word-animals-dog.webp) si ya existe; si no, su emoji. */
export function WordImage({ target }: { target: WordRef }) {
  const src = image(`word-${target.topicId}-${target.word.id}`);
  if (!src) return <>{target.word.image}</>;
  return <img src={src} alt="" draggable={false} className="pointer-events-none size-[78%] object-contain" />;
}

/** Nombre en inglés debajo de la imagen ("Teddy bear"), para ir asociando sonido, imagen y letras. */
export function WordCaption({ target }: { target: WordRef }) {
  return (
    <span className="absolute bottom-[5%] text-[calc(var(--size)*0.13)] leading-none font-bold text-night">
      {target.word.say.replace(/[.!?]$/, '')}
    </span>
  );
}
