import { image } from '../lib/images.ts';
import type { WordRef } from '../lib/review.ts';

/** Ilustración de la palabra (word-animals-dog.webp) si ya existe; si no, su emoji. */
export function WordImage({ target }: { target: WordRef }) {
  const src = image(`word-${target.topicId}-${target.word.id}`);
  if (!src) return <>{target.word.image}</>;
  return <img src={src} alt="" draggable={false} className="pointer-events-none size-[78%] object-contain" />;
}
