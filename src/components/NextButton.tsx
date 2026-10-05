import { motion } from 'motion/react';

/**
 * Botón grande para avanzar; aparece cuando Buddy terminó de hablar.
 * Es una flecha (→), no un ▶: el ▶ se reserva para "jugar" en el inicio.
 */
export function NextButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      className="moon-button size-26"
      initial={{ scale: 0 }}
      animate={{ scale: 1, x: [0, 8, 0] }}
      transition={{ scale: { duration: 0.3 }, x: { repeat: Infinity, duration: 1.4, ease: 'easeInOut' } }}
      onClick={onClick}
      aria-label="Next"
    >
      <svg viewBox="0 0 24 24" className="size-14" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 12h15M13 5l7 7-7 7" />
      </svg>
    </motion.button>
  );
}
