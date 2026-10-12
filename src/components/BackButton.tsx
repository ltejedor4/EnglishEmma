/** Flecha para volver (mapa, álbum). Arriba a la izquierda, lejos del 🔊. */
export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="absolute top-[max(16px,env(safe-area-inset-top))] left-4 z-10 grid size-16 place-items-center rounded-full bg-night/70 text-cream active:scale-95"
      onClick={onClick}
      aria-label="Back"
    >
      <svg viewBox="0 0 24 24" className="size-9" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 12H5M11 5l-7 7 7 7" />
      </svg>
    </button>
  );
}
