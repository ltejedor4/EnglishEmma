/**
 * ¿Se soltó cerca del destino? Con mucha tolerancia (una fracción del ancho del destino alrededor),
 * porque a los 5 años arrastrar con precisión cuesta.
 */
export function droppedNear(point: { x: number; y: number }, target: DOMRect | undefined, tolerance = 0.6): boolean {
  if (!target) return false;
  const margin = target.width * tolerance;
  return (
    point.x > target.left - margin &&
    point.x < target.right + margin &&
    point.y > target.top - margin &&
    point.y < target.bottom + margin
  );
}
