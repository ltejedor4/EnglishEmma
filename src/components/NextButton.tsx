import { motion } from 'motion/react';

/** Botón grande para avanzar; aparece cuando Buddy terminó de hablar. */
export function NextButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      className="moon-button size-26 pl-2 text-[44px]"
      initial={{ scale: 0 }}
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ scale: { repeat: Infinity, duration: 1.6 } }}
      onClick={onClick}
      aria-label="Next"
    >
      ▶
    </motion.button>
  );
}
