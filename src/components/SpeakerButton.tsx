/** Botón 🔊 siempre visible para repetir la instrucción. */
export function SpeakerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="absolute top-[max(24px,env(safe-area-inset-top))] right-6 size-22 rounded-full border-none bg-white/12 text-[44px]"
      onClick={onClick}
      aria-label="Repeat"
    >
      🔊
    </button>
  );
}
