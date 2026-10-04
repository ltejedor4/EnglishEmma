import type { ReactNode } from 'react';
import { image } from '../lib/images.ts';

interface ScreenProps {
  children: ReactNode;
  className?: string;
  /** Nombre de una imagen de fondo (p. ej. "bg-home"); sin ella queda el degradado nocturno. */
  background?: string;
}

/** Contenedor de pantalla completa, centrado y respetando el notch de los celulares. */
export function Screen({ children, className = '', background }: ScreenProps) {
  const src = background ? image(background) : undefined;
  return (
    <main
      className={`relative flex h-full flex-col items-center justify-center gap-6 bg-cover bg-bottom px-4 pt-[max(16px,env(safe-area-inset-top))] pb-[max(16px,env(safe-area-inset-bottom))] ${className}`}
      style={src ? { backgroundImage: `url("${src}")` } : undefined}
    >
      {children}
    </main>
  );
}

/** Área de un juego o paso de la sesión. */
export function GameArea({ children }: { children: ReactNode }) {
  return <div className="relative flex size-full flex-col items-center justify-center gap-7">{children}</div>;
}

/** Luna de respaldo para las pantallas nocturnas cuando falta bg-home (que ya trae su propia luna). */
export function Moon() {
  if (image('bg-home')) return null;
  return (
    <div className="absolute top-6 right-8 text-7xl" aria-hidden>
      🌙
    </div>
  );
}
