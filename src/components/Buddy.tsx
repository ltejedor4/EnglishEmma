import { motion } from 'motion/react';
import { image } from '../lib/images.ts';

export type Pose = 'hello' | 'listen' | 'point' | 'cheer' | 'puzzle' | 'sleepy' | 'sleeping';

/** Respaldo con emojis hasta que estén las ilustraciones de docs/IMAGENES.md. */
const FALLBACK: Record<Pose, string> = {
  hello: '🐶',
  listen: '🐶',
  point: '🐶',
  cheer: '🐶',
  puzzle: '🐶',
  sleepy: '🥱',
  sleeping: '😴',
};

export function Buddy({ pose, size = 160, onClick }: { pose: Pose; size?: number; onClick?: () => void }) {
  const src = image(`buddy-${pose}`);
  return (
    <motion.div
      key={pose}
      className="buddy"
      style={{ width: size, height: size, fontSize: size * 0.8 }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={pose === 'cheer' ? { scale: [1, 1.15, 1], y: [0, -20, 0], opacity: 1 } : { scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
    >
      {src ? <img src={src} alt="Buddy" draggable={false} /> : FALLBACK[pose]}
    </motion.div>
  );
}
