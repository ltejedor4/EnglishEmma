import { useEffect, useState } from 'react';
import { Buddy } from '../components/Buddy.tsx';
import { Moon, Screen } from '../components/Screen.tsx';
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
    <Screen className="gap-10" background="bg-home">
      <Moon />
      <Buddy pose={asleep ? 'sleeping' : 'sleepy'} size={220} onClick={() => say('common/see-you-tomorrow')} />
    </Screen>
  );
}
