# Imágenes — segunda tanda

La primera tanda (Buddy, rompecabezas, fondos, ícono) ya está en el juego. Esta tanda reemplaza los **emojis de las tarjetas** por ilustraciones del mismo estilo y prepara los juegos de la Fase 2.

## Cómo trabajar (igual que la primera vez)

1. Guarda cada imagen en `assets/images-src/` con **el nombre exacto** de las tablas (en minúsculas, con guiones).
2. Ejecuta `npm run images`. El juego las usa solo: cada tarjeta que tenga su imagen deja de mostrar el emoji.
3. Adjunta siempre la referencia indicada (`buddy-reference.png` o el rompecabezas del tema) para que los objetos se vean **iguales que en el rompecabezas**. Así Emma reconoce el mismo perro, la misma manzana…
4. Revisa: sin letras ni números escritos, fondo transparente, un solo objeto centrado.

### Bloque de estilo (va en todas)

```
Style: children's picture book illustration for a 5-year-old. Soft rounded shapes, thick smooth dark-brown outlines, flat colors with gentle soft shading, warm cheerful pastel palette with clear saturated main colors. Friendly and cute, never scary. Absolutely no text, letters, numbers or logos anywhere in the image.
```

---

## 1. Tarjetas de palabras (61) — cuadradas 1024×1024, fondo transparente

Se ven en una tarjeta color crema, así que el objeto tiene que **leerse de un vistazo**: grande, centrado, sin fondo ni escenario.

### Plantilla

```
A single [OBJETO], centered, large, filling about 80% of the image, seen from the front, nothing else in the image. Transparent background, PNG, no ground shadow.
[REFERENCIA]
Style: children's picture book illustration for a 5-year-old. Soft rounded shapes, thick smooth dark-brown outlines, flat colors with gentle soft shading, warm cheerful pastel palette with clear saturated main colors. Friendly and cute, never scary. Absolutely no text, letters, numbers or logos anywhere in the image.
```

`[REFERENCIA]` según el tema:
- Con rompecabezas: `Draw it exactly like the matching object in the attached scene (same shape and colors).` + adjuntar `puzzle-<tema>.png`
- Con Buddy: `Use the attached character reference for Buddy the puppy (same colors, eye patch, blue collar with yellow star tag).` + adjuntar `buddy-reference.png`

### Prioridad 1 — los temas que Emma está jugando

**Colors** · referencia: ninguna (que sea el color puro, sin otros colores que confundan)

| Archivo | `[OBJETO]` |
|---|---|
| `word-colors-red.png` | `big cute paint splash in pure bright red, with a tiny happy face` |
| `word-colors-blue.png` | `big cute paint splash in pure bright blue, with a tiny happy face` |
| `word-colors-yellow.png` | `big cute paint splash in pure bright yellow, with a tiny happy face` |
| `word-colors-green.png` | `big cute paint splash in pure bright green, with a tiny happy face` |
| `word-colors-pink.png` | `big cute paint splash in pure bright pink, with a tiny happy face` |
| `word-colors-orange.png` | `big cute paint splash in pure bright orange, with a tiny happy face` |

**Animals** · referencia: `puzzle-animals.png`

| Archivo | `[OBJETO]` |
|---|---|
| `word-animals-dog.png` | `dog (the brown and white spotted dog from the scene, NOT Buddy)` |
| `word-animals-cat.png` | `cat (the grey tabby cat from the scene), sitting` |
| `word-animals-fish.png` | `fish (the orange fish from the scene), jumping` |
| `word-animals-bird.png` | `bird (the little blue bird from the scene)` |
| `word-animals-cow.png` | `cow (the black and white cow from the scene), full body` |
| `word-animals-lion.png` | `lion (the friendly smiling lion from the scene), sitting` |

### Prioridad 2 — los próximos temas

**My body** · referencia: `puzzle-body.png` (la niña de la escena)

| Archivo | `[OBJETO]` |
|---|---|
| `word-body-head.png` | `head of the cheerful girl from the scene, smiling, front view` |
| `word-body-eyes.png` | `pair of big friendly cartoon eyes with eyebrows, nothing else` |
| `word-body-nose.png` | `cute small cartoon nose, close-up, skin colored like the girl's` |
| `word-body-mouth.png` | `big happy smiling cartoon mouth with pink lips, close-up` |
| `word-body-hands.png` | `two open child's hands, palms facing forward, waving` |
| `word-body-feet.png` | `two bare child's feet seen from the front, toes visible` |

**Food** · referencia: `puzzle-food.png`

| Archivo | `[OBJETO]` |
|---|---|
| `word-food-apple.png` | `red apple with a green leaf` |
| `word-food-banana.png` | `yellow banana` |
| `word-food-milk.png` | `glass of white milk` |
| `word-food-bread.png` | `loaf of bread` |
| `word-food-egg.png` | `white egg in a blue egg cup` |
| `word-food-water.png` | `glass of clear water with a light blue tint` |

**Numbers** · referencia: ninguna. **Ojo:** la IA a veces cuenta mal, revisa cada una antes de guardarla.

Plantilla especial (reemplaza la de arriba):

```
Exactly [N] cute smiling yellow stars, all the same size, arranged [DISPOSICIÓN], centered, with clear space between them so they are easy to count. Count carefully: exactly [N] stars, no more, no less. Transparent background, PNG.
Style: children's picture book illustration for a 5-year-old. Soft rounded shapes, thick smooth dark-brown outlines, flat colors. Absolutely no text, letters, numbers or digits anywhere in the image.
```

| Archivo | `[N]` | `[DISPOSICIÓN]` |
|---|---|---|
| `word-numbers-one.png` | 1 | `in the center` |
| `word-numbers-two.png` | 2 | `side by side` |
| `word-numbers-three.png` | 3 | `in a triangle` |
| `word-numbers-four.png` | 4 | `in a 2 by 2 square` |
| `word-numbers-five.png` | 5 | `like the five dots on a dice` |
| `word-numbers-six.png` | 6 | `in two rows of three` |
| `word-numbers-seven.png` | 7 | `in two rows: four on top, three below` |
| `word-numbers-eight.png` | 8 | `in two rows of four` |
| `word-numbers-nine.png` | 9 | `in a 3 by 3 square` |
| `word-numbers-ten.png` | 10 | `in two rows of five` |

### Prioridad 3 — el resto

**Toys** · referencia: `puzzle-toys.png`

| Archivo | `[OBJETO]` |
|---|---|
| `word-toys-ball.png` | `colorful beach ball` |
| `word-toys-doll.png` | `rag doll with orange pigtails and a pink dress` |
| `word-toys-car.png` | `small red toy car` |
| `word-toys-teddy-bear.png` | `brown teddy bear with a red bow tie, sitting` |
| `word-toys-blocks.png` | `small stack of colorful toy blocks` |
| `word-toys-train.png` | `wooden toy train with two colorful wagons` |

**Family** · referencia: `puzzle-family.png` (los mismos personajes de la escena; retrato de medio cuerpo)

| Archivo | `[OBJETO]` |
|---|---|
| `word-family-mom.png` | `portrait of the mom from the scene, waist up, smiling` |
| `word-family-dad.png` | `portrait of the dad from the scene, waist up, smiling` |
| `word-family-sister.png` | `portrait of the little sister (the smaller girl, about 3 years old) from the scene, waist up, smiling` |
| `word-family-grandma.png` | `portrait of the grandma from the scene, waist up, smiling` |
| `word-family-grandpa.png` | `portrait of the grandpa from the scene, waist up, smiling` |

> `sister` es **MaLu**, la hermana menor. Si quieres que se parezca a ella, agrega rasgos generales (color y largo de pelo…), sin subir fotos.

**Actions** · referencia: `buddy-reference.png` — **Buddy haciendo cada acción** (así se reconoce el verbo y no el niño)

| Archivo | `[OBJETO]` |
|---|---|
| `word-actions-jump.png` | `Buddy the puppy jumping high in the air, all four paws off the ground, with small motion lines` |
| `word-actions-run.png` | `Buddy the puppy running fast, side view, ears flying back, small dust puffs` |
| `word-actions-sit.png` | `Buddy the puppy sitting nicely on a small round cushion` |
| `word-actions-clap.png` | `Buddy the puppy standing on his hind legs clapping his front paws, with small clap sparkles` |
| `word-actions-dance.png` | `Buddy the puppy dancing happily on his hind legs, with a few musical notes around (notes are fine, no letters)` |
| `word-actions-sleep.png` | `Buddy the puppy sleeping in a small bed with a blanket, with a "zzz" drawn as three small cloud-like shapes (no letters)` |

**Clothes** · referencia: `puzzle-clothes.png`

| Archivo | `[OBJETO]` |
|---|---|
| `word-clothes-shirt.png` | `blue t-shirt, laid flat` |
| `word-clothes-shoes.png` | `pair of pink sneakers` |
| `word-clothes-hat.png` | `straw sun hat with a pink ribbon` |
| `word-clothes-socks.png` | `pair of yellow socks` |
| `word-clothes-pants.png` | `pair of blue jeans` |
| `word-clothes-jacket.png` | `green zip-up jacket with a hood` |

**Feelings** · referencia: `buddy-reference.png` — **la cara de Buddy** con cada emoción, muy marcada

| Archivo | `[OBJETO]` |
|---|---|
| `word-feelings-happy.png` | `Buddy the puppy's head, very happy, big open smile, eyes shining` |
| `word-feelings-sad.png` | `Buddy the puppy's head, sad, droopy ears, a single tear, small frown` |
| `word-feelings-angry.png` | `Buddy the puppy's head, angry in a cute way, frowning eyebrows, red cheeks, puffed face` |
| `word-feelings-tired.png` | `Buddy the puppy's head, tired, yawning, half-closed eyes` |
| `word-feelings-scared.png` | `Buddy the puppy's head, a little scared, wide eyes, ears back, small wobbly mouth` |
| `word-feelings-surprised.png` | `Buddy the puppy's head, surprised, round open mouth, very wide eyes, raised eyebrows` |

---

## 2. Para los juegos de la Fase 2

### Globos (Pop the Balloons) · vertical 1024×1536, fondo transparente

```
A single shiny party balloon in pure bright [COLOR], with a small highlight and a curly string hanging below, centered, filling most of the height. Transparent background, PNG. [bloque de estilo]
```

| Archivo | `[COLOR]` |
|---|---|
| `balloon-red.png` | `red` |
| `balloon-blue.png` | `blue` |
| `balloon-yellow.png` | `yellow` |
| `balloon-green.png` | `green` |
| `balloon-pink.png` | `pink` |
| `balloon-orange.png` | `orange` |

### Reverso de las cartas (Memory) · cuadrada 1024×1024

**`card-back.png`**

```
The back of a children's memory card: a rounded square card in deep night blue with a soft border in warm yellow, a small cute golden paw print in the center and a few tiny stars around it. Fill the whole image with the card. [bloque de estilo]
```

### Íconos de los temas para el mapa de islas · cuadrados 1024×1024, fondo transparente

Plantilla: `A small round badge icon showing [ÍCONO], centered, simple and bold so it reads well when small. Transparent background, PNG. [bloque de estilo]`

| Archivo | `[ÍCONO]` |
|---|---|
| `topic-colors.png` | `a painter's palette with six bright paint colors` |
| `topic-animals.png` | `a cute paw print` |
| `topic-body.png` | `a smiling child's face waving a hand` |
| `topic-food.png` | `a red apple and a banana` |
| `topic-numbers.png` | `a small abacus with colorful beads (no digits)` |
| `topic-toys.png` | `a teddy bear peeking out of a toy box` |
| `topic-family.png` | `a cozy little house with a heart above it` |
| `topic-actions.png` | `a little sneaker with motion lines` |
| `topic-clothes.png` | `a t-shirt on a hanger` |
| `topic-feelings.png` | `a happy face and a sad face side by side` |

### Calendario de noches · cuadrados 512×512, fondo transparente

| Archivo | Prompt |
|---|---|
| `sticker-star.png` | `A shiny golden star sticker with a cute sleepy smile and a thin white sticker border. Transparent background, PNG. [bloque de estilo]` |
| `sticker-moon.png` | `A soft yellow crescent moon sticker with a cute sleeping face and a thin white sticker border. Transparent background, PNG. [bloque de estilo]` |

---

## Orden sugerido

1. Tarjetas de **Colors** y **Animals** (12) ← se ven desde ya en el juego
2. Tarjetas de **My body**, **Food**, **Numbers** (22)
3. Tarjetas del resto (29)
4. Globos, reverso de cartas, íconos de temas y stickers (19)

Total: **80 imágenes**. Con Codex se pueden pedir por tandas (por ejemplo, un tema completo a la vez).
