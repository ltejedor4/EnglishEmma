/** Botón 🔊 siempre visible para repetir la instrucción. */
export function SpeakerButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="speaker" onClick={onClick} aria-label="Repeat">
      🔊
    </button>
  );
}
