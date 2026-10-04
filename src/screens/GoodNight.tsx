import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Buddy } from '../components/Buddy.tsx';
import { say } from '../lib/audio.ts';

/** Cierre de la sesión: Buddy bosteza, "Good night, Emma!" y se duerme. */
export function GoodNight() {
  const [asleep, setAsleep] = useState(false);

  useEffect(() => {
    let alive = true;
    say('common/good-night-emma', 'common/sweet-dreams').then(() => alive && setAsleep(true));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="screen home">
      <motion.div
        className="moon"
        aria-hidden
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2 }}
      >
        🌙
      </motion.div>
      <Buddy pose={asleep ? 'sleeping' : 'sleepy'} size={220} onClick={() => say('common/see-you-tomorrow')} />
    </main>
  );
}
