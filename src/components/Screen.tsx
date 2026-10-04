import type { ReactNode } from 'react';

/** Contenedor de pantalla completa, centrado y respetando el notch de los celulares. */
export function Screen({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <main
      className={`relative flex h-full flex-col items-center justify-center gap-6 px-4 pt-[max(16px,env(safe-area-inset-top))] pb-[max(16px,env(safe-area-inset-bottom))] ${className}`}
    >
      {children}
    </main>
  );
}

/** Área de un juego o paso de la sesión. */
export function GameArea({ children }: { children: ReactNode }) {
  return <div className="relative flex size-full flex-col items-center justify-center gap-7">{children}</div>;
}

export function Moon() {
  return (
    <div className="absolute top-6 right-8 text-7xl" aria-hidden>
      🌙
    </div>
  );
}
