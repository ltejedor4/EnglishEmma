# Imágenes con ChatGPT — guía y prompts

## Cómo trabajar

1. **Todo en una misma conversación de ChatGPT** (o en un Proyecto de ChatGPT). Así recuerda el estilo.
2. **Primero Buddy** (paso 1). Cuando tengas el que más te guste, descárgalo y **adjúntalo en cada prompt siguiente**. Es la mejor forma de que todo parezca del mismo juego.
3. Cada prompt ya incluye el **bloque de estilo**. No lo quites aunque parezca repetido.
4. Si una imagen sale casi bien, pide correcciones puntuales ("same image, but make the cow bigger") en vez de regenerar desde cero.
5. **Revisa siempre:** que no haya letras ni números raros, que estén todos los objetos pedidos y que se distingan bien.
6. Guarda los archivos en `assets/images-src/` con el nombre indicado (`buddy-happy.png`, `puzzle-animals.png`…). Yo las convierto a WebP y las optimizo.

### Bloque de estilo (ya va incluido en cada prompt)

```
Style: children's picture book illustration for a 5-year-old. Soft rounded shapes, thick smooth dark-brown outlines, flat colors with gentle soft shading, warm cheerful pastel palette with clear saturated main colors. Simple, uncluttered composition with big, easy-to-recognize objects. Friendly and cute, never scary. Absolutely no text, letters, numbers or logos anywhere in the image.
```

---

## 1. Buddy, la mascota (lo primero)

**`buddy-reference.png`** — hoja de personaje · cuadrado (1024×1024)

```
Create a character reference sheet for "Buddy", the mascot of a children's English learning game.

Buddy is a small, round, adorable puppy: cream / light golden fur, one light-brown patch around his left eye, big floppy light-brown ears, huge friendly dark eyes with white highlights, a tiny black nose, a big happy smile, a short wagging tail, and a small blue collar with a round yellow star tag. He looks young, kind and playful, like a best friend for a 5-year-old girl.

Show Buddy three times on a plain white background: front view, three-quarter view and side view, full body, same size, well separated.

Style: children's picture book illustration for a 5-year-old. Soft rounded shapes, thick smooth dark-brown outlines, flat colors with gentle soft shading, warm cheerful pastel palette with clear saturated main colors. Simple, uncluttered composition with big, easy-to-recognize objects. Friendly and cute, never scary. Absolutely no text, letters, numbers or logos anywhere in the image.
```

### Poses de Buddy · cuadrado (1024×1024), **fondo transparente**

Usa esta plantilla y reemplaza `[POSE]` por cada pose de la tabla. **Adjunta `buddy-reference.png`.**

```
Using the attached character reference, draw Buddy the puppy exactly as designed (same colors, same eye patch, same blue collar with yellow star tag), full body, centered, filling most of the image, [POSE].

Transparent background, PNG, no shadow on the ground, nothing else in the image.

Style: children's picture book illustration for a 5-year-old. Soft rounded shapes, thick smooth dark-brown outlines, flat colors with gentle soft shading, warm cheerful pastel palette with clear saturated main colors. Friendly and cute, never scary. Absolutely no text, letters, numbers or logos anywhere in the image.
```

| Archivo | `[POSE]` | Dónde se usa |
|---|---|---|
| `buddy-hello.png` | `waving one paw hello with a big happy smile` | Pantalla de inicio |
| `buddy-listen.png` | `sitting, tilting his head and holding one paw next to his ear, as if listening carefully` | Mientras suena la pregunta |
| `buddy-point.png` | `standing and pointing forward with one paw, gentle encouraging smile` | Cuando muestra la respuesta correcta |
| `buddy-cheer.png` | `jumping with joy, both front paws up in the air, eyes closed with happiness` | Celebraciones |
| `buddy-puzzle.png` | `proudly holding up a big shiny golden jigsaw puzzle piece with both paws` | ¡Ficha nueva! |
| `buddy-sleepy.png` | `sitting and yawning sleepily, eyes half closed, wearing a small blue night cap with a star` | Good night |
| `buddy-sleeping.png` | `curled up asleep on a small round pillow, peaceful smile` | Fin de la sesión |

---

## 2. Escenas / rompecabezas (una por tema)

Cada imagen sirve para **dos cosas**: es el **rompecabezas** del tema y la **escena** del juego "Find it in the scene". Por eso todos los objetos del tema deben estar **completos, grandes, separados entre sí y lejos de los bordes**.

**Formato:** horizontal (1536×1024). **Adjunta `buddy-reference.png`** en cada una.

### Plantilla

```
Using the attached character reference for Buddy the puppy, create a horizontal scene for a children's game: [ESCENA]

Every object in this list must appear exactly once, be complete, large and clearly recognizable, not overlapping with anything else, and well away from the edges of the image: [OBJETOS].

Buddy appears small in a corner, happily watching. Calm, simple background with few extra details so the main objects stand out.

Style: children's picture book illustration for a 5-year-old. Soft rounded shapes, thick smooth dark-brown outlines, flat colors with gentle soft shading, warm cheerful pastel palette with clear saturated main colors. Simple, uncluttered composition with big, easy-to-recognize objects. Friendly and cute, never scary. Absolutely no text, letters, numbers or logos anywhere in the image.
```

| Archivo | `[ESCENA]` | `[OBJETOS]` |
|---|---|---|
| `puzzle-colors.png` | `a sunny garden with a rainbow in a bright blue sky` | `a red apple, a red fire truck, a yellow sun, a yellow banana, a green tree, a green frog, a pink flower, a pink pig, an orange carrot, an orange fruit` |
| `puzzle-animals.png` | `a friendly farm with a small pond` | `a dog, a cat, a fish jumping out of the pond, a bird on a fence, a cow, a gentle smiling lion` |
| `puzzle-body.png` | `a sunny park; a cheerful cartoon little girl about 5 years old stands in the center, full body, facing the viewer, waving` | `her head, her two eyes, her nose, her mouth, her two hands (open, clearly visible), her two feet (in small sneakers)` — y agrega al final: `The girl must be big, taking most of the height of the image, so each body part is easy to touch.` |
| `puzzle-food.png` | `a cozy kitchen table seen from the front` | `a red apple, a yellow banana, a glass of milk, a loaf of bread, a white egg in an egg cup, a glass of water` |
| `puzzle-numbers.png` | `a calm meadow under a light blue sky` | `one big sun, two birds, three butterflies, four flowers` — y agrega: `Count carefully: exactly one sun, exactly two birds, exactly three butterflies, exactly four flowers, spaced so they are easy to count.` |
| `puzzle-toys.png` | `a tidy, colorful playroom with a soft rug` | `a ball, a rag doll, a small red toy car, a teddy bear, a stack of colorful toy blocks, a wooden toy train` |
| `puzzle-family.png` | `a happy family in a sunny living room, everyone standing in a row and smiling` | `a mom, a dad, a big sister about 5 years old, a little sister about 3 years old, a grandma, a grandpa` |
| `puzzle-actions.png` | `a playground on a sunny day with several cheerful children` | `a child jumping, a child running, a child sitting on a bench, a child clapping, a child dancing, a child sleeping on a picnic blanket` |
| `puzzle-clothes.png` | `a bright bedroom with a clothesline between two hooks` | `a blue shirt, a pair of pink shoes on the floor, a sun hat, a pair of yellow socks hanging, blue pants hanging, a jacket on a hook` |
| `puzzle-feelings.png` | `a sunny park bench scene with six cute round cartoon children's faces, each one big and clearly expressing a feeling` | `a happy face, a sad face with a small tear, an angry face with red cheeks, a tired yawning face, a scared face, a surprised face with round open mouth` |

> **Familia:** si quieres que se parezcan a ustedes, describe en el prompt rasgos generales (color de pelo, lentes, barba, pelo largo/corto…). Mejor no subir fotos reales de las niñas a ChatGPT.
>
> **Números:** la IA a veces se equivoca contando. Cuenta los objetos antes de guardarla.

---

## 3. Pantallas y app

| Archivo | Formato | Prompt |
|---|---|---|
| `bg-home.png` | horizontal 1536×1024 | ver abajo |
| `bg-map.png` | horizontal 1536×1024 | ver abajo |
| `icon.png` | cuadrado 1024×1024 | ver abajo |

**`bg-home.png`** — fondo de la pantalla de inicio (de noche, tranquilo)

```
A calm, cozy night background for a children's game home screen: a soft deep-blue night sky with a few gentle twinkling stars, a big friendly smiling crescent moon in the upper right, soft rolling hills at the bottom with a tiny cozy house with warm lit windows. The center of the image must be mostly empty, because buttons and a character will be placed on top. Peaceful bedtime mood, low contrast, no bright flashes.

Style: children's picture book illustration for a 5-year-old. Soft rounded shapes, thick smooth dark-brown outlines, flat colors with gentle soft shading. Friendly and cute, never scary. Absolutely no text, letters, numbers or logos anywhere in the image.
```

**`bg-map.png`** — mapa de temas (adjunta `buddy-reference.png`)

```
A whimsical map for a children's game seen from above, at dusk: a gentle winding dotted path connecting ten small round islands floating on a calm soft-blue sea. Each island is empty and flat on top (game icons will be placed there), with small decorations around it: palm trees, flowers, little bridges between islands. Calm and magical evening mood with soft warm light.

Style: children's picture book illustration for a 5-year-old. Soft rounded shapes, thick smooth dark-brown outlines, flat colors with gentle soft shading, warm pastel palette. Friendly and cute, never scary. Absolutely no text, letters, numbers or logos anywhere in the image.
```

**`icon.png`** — ícono de la app (adjunta `buddy-reference.png`)

```
An app icon: the head of Buddy the puppy from the attached reference, front view, big happy smile, centered and filling about 70% of the image, on a solid warm yellow background. No border, no rounded corners (the system adds them).

Style: children's picture book illustration, soft rounded shapes, thick smooth dark-brown outlines, flat colors. Absolutely no text, letters or numbers.
```

---

## 4. Más adelante (no hace falta ahora)

- **Tarjetas de palabras** (para reemplazar los emojis): una imagen por palabra, fondo transparente, cuadrada. Plantilla:
  ```
  A single [OBJETO], centered, large, filling most of the image, transparent background, PNG. [bloque de estilo]
  ```
  Pídelas de a varias por imagen ("a 3×2 grid of: …, each one well separated on a white background") para ahorrar tiempo; yo las recorto.
- Stickers de celebración, globos de colores (Pop the Balloons).

---

## Orden sugerido

1. `buddy-reference.png` ← lo más importante; tómate tu tiempo
2. `buddy-hello`, `buddy-cheer`, `buddy-puzzle`, `buddy-sleepy` (las del MVP)
3. `puzzle-colors`, `puzzle-animals` (temas del MVP)
4. `bg-home`, `icon`
5. El resto cuando haya tiempo
