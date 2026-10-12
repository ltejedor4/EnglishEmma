/**
 * Dónde está cada palabra dentro de la escena del rompecabezas de su tema (puzzle-<tema>.webp).
 * Sirve para "Find it in the scene" y para el rompecabezas completo que cobra vida.
 *
 * Cada zona es una elipse [centroX, centroY, radioX, radioY] en % del ancho y alto de la imagen.
 * Una palabra puede tener varias zonas ("red" = el camión de bomberos y la manzana). Si dos se
 * superponen, gana la que está más abajo en la lista (los ojos van después de la cabeza).
 * Las palabras que no aparecen en la escena (la segunda tanda de Animals y Colors) no se listan.
 */
export type Spot = [cx: number, cy: number, rx: number, ry: number];

export const scenes: Record<string, Record<string, Spot[]>> = {
  // "blue" no tiene zona: lo único azul es el cielo, que no es una cosa que se pueda señalar.
  colors: {
    red: [[23, 43, 17, 15], [33.5, 70, 7, 11]],
    yellow: [[13.5, 15.5, 9, 13], [37.5, 87, 11.5, 8.5]],
    green: [[53.5, 21, 17, 19], [51, 67.5, 7, 10]],
    pink: [[68.5, 63, 6.5, 10], [84, 51, 11, 14.5]],
    orange: [[66, 86.5, 13, 8.5], [88, 79, 7.5, 12]],
  },
  animals: {
    // El perro grande y también Buddy.
    dog: [[25, 47, 11, 16], [10, 72, 9, 15]],
    cow: [[58.5, 32, 13, 20]],
    cat: [[44, 54, 8.5, 13]],
    fish: [[61, 67, 6.5, 12]],
    bird: [[91, 18, 5.5, 8]],
    lion: [[86, 49, 12, 20.5]],
  },
  body: {
    head: [[47, 22, 15, 20]],
    eyes: [[42, 26.3, 3.3, 5], [51.2, 24.5, 3.3, 5]],
    mouth: [[47.8, 34, 4.5, 4.2]],
    nose: [[47.2, 28.2, 2.2, 2.8]],
    hands: [[28.7, 32, 4.5, 6.5], [63.5, 58, 4.2, 6]],
    feet: [[37.5, 91.5, 5.5, 5.5], [57, 90.5, 5.5, 6]],
  },
  food: {
    apple: [[13, 67, 10, 15]],
    banana: [[38.5, 74, 13, 13]],
    milk: [[44.5, 51, 7.8, 15.5]],
    bread: [[75, 45.5, 15.5, 14.5]],
    egg: [[61.5, 75, 6.5, 15]],
    water: [[87, 74, 8, 16]],
  },
  // Para contar: un sol, dos pájaros, tres mariposas y cuatro flores.
  numbers: {
    one: [[49.5, 18, 11, 15]],
    two: [[26, 23, 10.5, 12], [74, 26, 10, 11]],
    three: [[34.5, 48, 6.5, 10], [56, 50.5, 7.5, 10], [77, 50.5, 7.5, 10]],
    four: [[36, 76, 6, 10], [53, 77, 5.5, 9], [72, 76, 6, 9.5], [89.5, 75.5, 5.5, 9.5]],
  },
  toys: {
    ball: [[39, 40, 10.5, 14]],
    doll: [[68.5, 42, 12, 18.5]],
    car: [[13, 67.5, 11, 12]],
    'teddy-bear': [[36, 72, 11, 17]],
    blocks: [[58.5, 73, 9.5, 13.5]],
    train: [[85, 73, 13.5, 13]],
  },
  // La niña de rosado es Emma; "sister" es la pequeña (MaLu).
  family: {
    grandpa: [[9, 49, 7, 36]],
    dad: [[25, 48, 7.2, 37]],
    mom: [[65, 50, 7, 34]],
    grandma: [[80, 52, 7, 32]],
    sister: [[52.5, 64, 6.2, 20]],
  },
  actions: {
    jump: [[19.5, 25, 11, 19.5]],
    run: [[48.5, 31, 10, 21]],
    sit: [[78, 33, 7.5, 18.5]],
    clap: [[14, 74, 10, 21.5]],
    dance: [[40.5, 75, 11, 21]],
    sleep: [[73.5, 79, 16.5, 11]],
  },
  clothes: {
    shirt: [[29, 28, 11, 14]],
    socks: [[47, 28.5, 7.5, 11]],
    pants: [[66, 32, 9.5, 18.5]],
    jacket: [[87.5, 30, 11, 16]],
    hat: [[82.5, 61.5, 11, 9.5]],
    shoes: [[49, 83, 11, 7.5]],
  },
  feelings: {
    happy: [[18, 30, 12, 19.5]],
    sad: [[47.5, 30, 14, 20.5]],
    angry: [[77, 29.5, 12, 19.5]],
    tired: [[18, 71.5, 13.5, 19.5]],
    scared: [[46.5, 71.5, 11.5, 19]],
    surprised: [[72, 72, 13, 18.5]],
  },
};

/** ¿La palabra se puede buscar en la escena de su tema? */
export const inScene = (topicId: string, wordId: string) => !!scenes[topicId]?.[wordId];
