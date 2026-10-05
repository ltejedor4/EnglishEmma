import { motion } from 'motion/react';
import { image } from '../lib/images.ts';
import type { Pose } from '../lib/pose.ts';

export type { Pose };

const SLEEPY: Pose[] = ['sleepy', 'sleeping'];

/**
 * Usa la ilustración de la pose (buddy-hello.webp…) si existe; si no, el Buddy genérico (buddy.webp,
 * sacado de la hoja de referencia) y, como último recurso, un emoji.
 */
export function Buddy({ pose, size = 160, onClick }: { pose: Pose; size?: number; onClick?: () => void }) {
  const posed = image(`buddy-${pose}`);
  const src = posed ?? image('buddy');
  // Sin ilustración de "dormido", el Buddy genérico se inclina y aparecen unas zetas.
  const fakeSleep = !posed && SLEEPY.includes(pose);
  return (
    <motion.div
      key={pose}
      className="relative grid shrink-0 cursor-pointer place-items-center leading-none"
      style={{ width: size, height: size, fontSize: size * 0.8 }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={
        pose === 'cheer'
          ? { scale: [1, 1.15, 1], y: [0, -20, 0], opacity: 1 }
          : { scale: 1, opacity: 1, rotate: fakeSleep ? -8 : 0 }
      }
      transition={{ duration: 0.5 }}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt="Buddy"
          draggable={false}
          className={`pointer-events-none size-full object-contain ${fakeSleep ? 'brightness-75' : ''}`}
        />
      ) : (
        { hello: '🐶', listen: '🐶', point: '🐶', cheer: '🐶', puzzle: '🐶', sleepy: '🥱', sleeping: '😴', hungry: '🐶', talk: '🐶' }[pose]
      )}
      {src && fakeSleep && (
        <motion.span
          className="absolute -top-[5%] right-0"
          style={{ fontSize: size * 0.25 }}
          animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2.4 }}
        >
          💤
        </motion.span>
      )}
    </motion.div>
  );
}
