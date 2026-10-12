import { motion } from 'motion/react';
import { image } from '../lib/images.ts';
import { lastNights } from '../lib/nights.ts';

/**
 * Calendario de noches: una estrella por cada noche jugada de la última semana (la luna es la de hoy).
 * En el celular vertical va debajo del ⚙️ de padres, porque no caben uno al lado del otro.
 */
export function NightCalendar({ sessionDays, day }: { sessionDays: string[]; day: string }) {
  const star = image('sticker-star');
  const moon = image('sticker-moon');
  return (
    <div
      className="absolute top-[max(76px,env(safe-area-inset-top))] left-1/2 sm:top-[max(14px,env(safe-area-inset-top))] flex -translate-x-1/2 items-center gap-2 rounded-full bg-night/55 px-4 py-2"
      data-nights={sessionDays.length}
      aria-hidden
    >
      {lastNights(sessionDays, day).map((night) => {
        const isToday = night.day === day;
        if (!night.played) {
          return (
            <span
              key={night.day}
              className={`size-9 rounded-full border-2 border-dashed ${isToday ? 'animate-glow border-moon' : 'border-white/25'}`}
              data-night=""
            />
          );
        }
        const src = isToday ? moon : star;
        return (
          <motion.span
            key={night.day}
            className="grid size-9 place-items-center text-3xl leading-none"
            initial={isToday ? { scale: 0.2, rotate: -40 } : false}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.9 }}
            data-night="played"
          >
            {src ? <img src={src} alt="" className="size-full object-contain" draggable={false} /> : isToday ? '🌙' : '⭐'}
          </motion.span>
        );
      })}
    </div>
  );
}
