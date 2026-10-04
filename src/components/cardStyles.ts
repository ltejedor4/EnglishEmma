import type { CSSProperties } from 'react';

/** Tarjeta de palabra: cuadrada, del tamaño de --size, con la imagen a 60 %. */
export const cardClass =
  'relative grid size-(--size) place-items-center rounded-[32px] border-6 border-transparent bg-cream text-[calc(var(--size)*0.6)] leading-none shadow-[0_8px_0_rgb(0_0_0/0.25)]';

/** La opción correcta brilla después de un error. */
export const cardHintClass = 'border-moon shadow-[0_0_0_10px_rgb(255_233_168/0.45),0_8px_0_rgb(0_0_0/0.25)]';

export const cardSize = (size: string) => ({ '--size': size }) as CSSProperties;
