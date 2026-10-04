import { motion } from 'motion/react';

/** Celebración tranquila de noche: unas estrellas que aparecen despacio y se desvanecen. */
export function Stars({ count = 7 }: { count?: number }) {
  return (
    <div className="stars" aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.2, 1.2, 0.9], x: Math.cos(angle) * 160, y: Math.sin(angle) * 120 }}
            transition={{ duration: 1.4, delay: i * 0.06, ease: 'easeOut' }}
          >
            ⭐
          </motion.span>
        );
      })}
    </div>
  );
}
