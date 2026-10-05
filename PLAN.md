# Emma English — Plan del proyecto

Juego web para que Emma (5 años, hispanohablante) empiece a aprender inglés jugando.
Se juega en tablet o celular desde el navegador, instalable como app (PWA) y desplegado en el VPS propio.

## 0. Por qué existe

Todas las noches papá/mamá hace su sesión de Duolingo y Emma quiere hacerla también, pero es demasiado
avanzada: frases largas, sin contexto, y ella solo repite lo que escucha sin entenderlo.
Este juego es **"su propio Duolingo"**: misma rutina nocturna, al lado de papá/mamá, pero a su nivel y
pensado para que **entienda y retenga palabras**, no para que repita sonidos.

Lo que ya le encanta de Duolingo y queremos conservar:
- Hacerlo **juntos, cada noche**, como un ritual.
- **Ganar una ficha de rompecabezas** al terminar cada sesión.
- Hacerlo **ella misma**: Emma toca, arrastra y decide todo; papá/mamá acompaña.

---

## 1. Principios pedagógicos (guían todas las decisiones)

1. **Entender antes que repetir.** El juego habla en inglés y Emma demuestra que entendió eligiendo, tocando o moviendo. Elegir la imagen correcta prueba comprensión; repetir no.
2. **Todo por voz e imagen.** Todavía no lee bien: cero dependencia del texto. El texto en inglés aparece solo como apoyo visual.
3. **Pocas palabras, mucha repetición espaciada.** Cada noche: 2–3 palabras nuevas + 3–4 de repaso de días anteriores.
4. **Contexto, no tarjetas sueltas.** La misma palabra en frases y escenas distintas: "Where is the **dog**?", "The **dog** is big", "The **dog** says woof!", un perro dentro de la casa.
5. **Sin castigo.** Un error = la voz repite la palabra y resalta la opción correcta. Nada de "vidas" ni sonidos negativos. La palabra simplemente vuelve a salir más seguido.
6. **Emma lo hace todo.** Ella controla el juego de principio a fin; el adulto acompaña y celebra.
7. **Ritual de noche, corto y tranquilo.** 5–7 minutos, con un cierre claro ("Good night, Emma!").
8. **Puente con la vida real.** Cada tema trae una "misión para casa" para papá/mamá (frases para usar en la rutina diaria).

---

## 2. Stack técnico

| Pieza | Elección | Por qué |
|---|---|---|
| Framework | **React + Vite** | Ecosistema más grande (drag & drop, animaciones, audio), más ejemplos y ayuda disponibles. Angular descartado: excesivo para un juego pequeño. |
| Lenguaje | TypeScript | Contenido (temas/palabras) tipado, menos errores |
| Estilos | CSS propio o Tailwind | Botones enormes, colores suaves, animaciones simples |
| Animaciones | `motion` (Framer Motion) | Fichas que vuelan, estrellas que aparecen, transiciones suaves |
| Arrastrar | `drag` de `motion` | Colocar fichas del rompecabezas con el dedo, sin otra librería |
| Audio | **Howler.js** con `.mp3` pregenerados | Suena igual en todos los dispositivos y funciona sin internet |
| PWA | `vite-plugin-pwa` | Pantalla de inicio, pantalla completa, offline |
| Progreso | `localStorage` en el dispositivo | Sin backend ni cuentas en la v1 |
| Despliegue | Build estático servido por **Caddy** en el VPS | HTTPS automático (necesario para la PWA) |

> No hace falta backend en la primera versión: la app es 100 % estática.

### Detalles importantes de plataforma
- **Desbloqueo de audio:** los navegadores móviles no reproducen sonido hasta el primer toque. La pantalla de inicio tiene un botón grande ▶️ antes del primer "Hello Emma!".
- **Instalar como app desde el día 1:** Safari puede borrar el `localStorage` de sitios no usados en 7 días; como app instalada en pantalla de inicio no ocurre. Perder sus fichas del rompecabezas sería un drama.

---

## 3. Audio: voces naturales con TTS, generadas una sola vez

**Nada de TTS en tiempo real** (necesita internet, rompe el modo offline, tiene latencia, cuesta por reproducción y expone la API key).
En su lugar, un script genera los `.mp3` **una vez** a partir del texto del contenido y se guardan en el repo.

### Tamaño estimado
- 10 temas × ~7 palabras × (palabra + 2–3 frases) + celebraciones/instrucciones ≈ **250–300 clips**
- Clips de 1–2 s, mp3 mono 48–64 kbps ≈ 10–15 KB c/u → **~3–5 MB en total**

### Servicios TTS (revisar precios actuales; por este volumen todos salen casi gratis)
| Opción | Notas |
|---|---|
| **ElevenLabs** | La más natural y expresiva; voces cálidas ideales para la mascota |
| **OpenAI `gpt-4o-mini-tts`** | Acepta instrucciones de estilo: *"speak slowly and warmly, like a kindergarten teacher"* |
| **Azure Speech** | SSML con estilo `cheerful`, control de velocidad y tono |
| **Amazon Polly (Neural)** | Tiene voces infantiles (Ivy, Kevin) |
| **Kokoro TTS** (local, open source) | Gratis, corre en el PC, calidad sorprendente |

### Pipeline: `scripts/generate-audio.ts`
1. Lee `src/content/*.ts` (cada palabra/frase trae su **texto**).
2. Calcula un hash de *texto + voz + velocidad* → **solo genera lo que falta**.
3. Post-proceso con `ffmpeg`: recortar silencios, normalizar volumen (`loudnorm`), mono 48–64 kbps.
4. Guarda en `public/audio/<tema>/<id>.mp3` + un `manifest.json`.
5. Opcional: un **audio sprite por tema** (Howler lo soporta) → un solo archivo por tema.

### Para que suene natural para una niña de 5 años
- Velocidad 0.85–0.9× y una pequeña pausa antes de la palabra clave: "Where is the… **dog**?"
- **2–3 variantes** de cada celebración ("Great job!", "Awesome!", "You did it!") elegidas al azar.
- **Voz de papá/mamá** grabada para lo personal: "Great job, Emma!", "Good night, Emma!".
- Una voz fija para Buddy (la mascota) y otra para el narrador.

---

## 4. Contenido: temas (orden sugerido)

| # | Tema | Palabras (ejemplo) | Frase modelo |
|---|---|---|---|
| 1 | Colors | red, blue, yellow, green, pink, orange | "Find the **red** one!" |
| 2 | Animals | dog, cat, fish, bird, cow, lion | "Where is the **cat**?" |
| 3 | My body | head, eyes, nose, mouth, hands, feet | "Touch your **nose**!" |
| 4 | Food | apple, banana, milk, bread, egg, water | "I want an **apple**." |
| 5 | Numbers 1–10 | one … ten | "How many **dogs**?" |
| 6 | Toys | ball, doll, car, teddy bear, blocks | "Give me the **ball**." |
| 7 | Family | mom, dad, baby, grandma, grandpa | "This is my **mom**." |
| 8 | Actions | jump, run, sit, clap, dance, sleep | "Let's **jump**!" |
| 9 | Clothes | shirt, shoes, hat, socks, pants | "Put on your **shoes**." |
| 10 | Feelings | happy, sad, angry, tired, scared | "I am **happy**!" |

Cada tema es un archivo de datos con **texto** (el audio se genera a partir de él), así agregar temas no requiere tocar el código de los juegos.

```ts
// src/content/animals.ts
export default {
  id: 'animals',
  title: 'Animals',
  icon: '🐶',
  words: [
    {
      id: 'dog',
      image: '🐶',
      say: 'dog',
      phrases: ['Where is the dog?', 'The dog is big!', 'The dog says woof!'],
    },
    // ...
  ],
  scene: 'scenes/farm.svg',          // escena con las palabras del tema
  puzzle: 'puzzles/animals-farm.svg', // imagen del rompecabezas del tema
  homeMission: ['What does the dog say?', 'Look! A cat!', "Let's feed the fish."],
} satisfies Topic;
```

---

## 5. Aprendizaje real: repaso espaciado (desde el MVP)

El juego avanza por **palabras dominadas**, no por "temas terminados".

- Cada palabra guarda su estado: `{ box: 0–3, lastSeen, firstTryCorrectDays: [] }`.
- **Sesión nocturna** = 2–3 palabras nuevas + 3–4 de repaso (prioridad: cajas bajas y las que hace más días que no ve).
- Acierto a la primera → sube de caja (se repasa menos seguido). Error → vuelve a la caja 0 (sin castigo visible).
- Una palabra cuenta como **aprendida** cuando la acierta a la primera en **3 días distintos**.
- Un tema nuevo se desbloquea cuando la mayoría de las palabras del anterior están aprendidas; las viejas siguen saliendo en los repasos.
- Lógica aislada en `src/lib/review.ts` (pura, fácil de probar).

---

## 6. Recompensas: el rompecabezas 🧩

Como en Duolingo, **cada sesión terminada = una ficha nueva**.

- Cada tema tiene su rompecabezas (6 fichas en los primeros temas, 9 después), con una ilustración del tema: una granja con los animales, una cocina con la comida…
- Al terminar la sesión, la ficha **llega volando** con un sonido suave y **Emma la coloca ella misma** arrastrándola a su lugar (encaje con mucha tolerancia).
- **Rompecabezas completo** → la imagen cobra vida: cada cosa es tocable y dice su palabra ("dog!", "cow!"). Es una recompensa y a la vez un repaso.
- **Álbum de rompecabezas** en el mapa: los completos se ven enteros, el actual con sus huecos.
- **Calendario de noches:** una estrellita o luna por cada noche jugada (su "racha", como la de papá/mamá).

---

## 7. Mini-juegos y estructura de la lección

Todos reutilizan el mismo contenido de cada tema, con la ilustración de la tarjeta y su nombre escrito debajo.

| Juego | Cómo se juega | Estado |
|---|---|---|
| **Listen & Touch** | "Where is the dog?" / "The sky is blue." / "Find these two! red… and… blue" → tocar la(s) tarjeta(s). 2 → 4 opciones | ✅ hecho |
| **Memory** | 3 pares de cartas boca abajo (`card-back`); al voltear, cada carta *dice* su palabra; emparejar | Etapa A |
| **Pop the Balloons** | Suben globos (de colores en *Colors*, con la tarjeta colgando en los demás temas); "Pop… red!" → reventar el correcto; si se escapa, vuelve a subir | Etapa A |
| **Feed Buddy** | Buddy tiene hambre: "Give me… apple!" → arrastrar la tarjeta hasta él (el mismo arrastre del rompecabezas) | Etapa A |
| **Your turn! Say it!** 🎤 | Buddy dice la palabra y Emma la dice en voz alta (ver sección 7b) | Etapa B |
| Find it in the scene | Buscar el objeto dentro de la escena del rompecabezas del tema | siguiente |
| Simon Says | "Touch your nose!": Emma lo hace de verdad y toca ✅. Ideal para *My body* y *Actions* | siguiente |

**Errores sin castigo en todos los juegos:** la tarjeta se mueve suavemente, "Look, here it is!" y la correcta brilla.

### Flujo de la lección de la noche (5–7 min, ≈25–30 interacciones)

Hasta ahora una lección duraba **menos de 2 minutos** (solo Listen & Touch). La lección pasa a armarse con varias actividades:

1. ▶ → "Hello, Emma! Let's play!"
2. **Repaso:** Listen & Touch mezclado con palabras de días anteriores (~4).
3. **Palabras nuevas:** presentación (tarjeta + palabra + frase) y una ronda directa (~6).
4. **Juego 1:** Memory, Balloons o Feed Buddy (~5).
5. **Your turn! Say it!** con 3–4 palabras (~4).
6. **Juego 2:** otro de los tres, distinto del juego 1 (~5).
7. **Cierre rápido:** 2–3 Listen & Touch con frase o par.
8. **¡Ficha nueva!** 🧩 → "Good night, Emma! Sweet dreams!" y Buddy se duerme.

- Los dos juegos de la noche **rotan** (según el número de noches jugadas), así cada noche se siente distinta.
- **Práctica libre** (después de la ficha): la misma estructura con un solo juego + Say it!, sin ficha. Si le va bien trae palabras nuevas (máximo 6 por día); si no, solo repaso.
- **Variedad:** toda actividad usa al menos 3 palabras distintas; en Listen & Touch una palabra sale máximo 3 veces y nunca dos seguidas.
- Desde la **zona de padres** se puede pedir un solo juego (por ejemplo, solo Memory o solo Say it!) en cualquier tema.

---

## 7b. Hablar: "Your turn! Say it!" 🎤

Lo que más le gusta de Duolingo. Va **después** de que conoce la palabra (escuchar antes que hablar).

1. Buddy: "Your turn!" + la palabra ("Dog.").
2. Aparece un **🎤 grande**; Emma **lo toca** y habla (así no se graba la voz de Buddy).
3. Unos 4 s escuchando, con ondas animadas y Buddy atento.
4. **Si se parece:** celebración ("Well said!") y estrellas.
5. **Si no:** "Let's try again!" + la palabra → segundo intento.
6. **Si tampoco:** "Great try!" y sigue. **Nunca castiga.**

**Evaluación automática y generosa** (`src/lib/speech.ts`):
- Reconocimiento de voz del navegador (`SpeechRecognition` / `webkitSpeechRecognition`, inglés de EE. UU., hasta 5 alternativas).
- `matchSpoken(palabra, alternativas)`, función pura con pruebas: compara palabra a palabra y de a dos ("teddy bear") con similitud de Levenshtein ≥ 0,5, equivalencias del acento hispano (y↔j, v↔b, sh↔ch, "e" inicial) y una lista opcional `sounds` por palabra con lo que el reconocedor suele entender (yellow → "jello").

**Respaldo** (sin soporte, sin internet, permiso denegado, iPad como app instalada sin servicio, o elegido por los padres): **grabar y escucharse**. Se graban 3 s, "Listen to you!", suena su voz y ella toca ✅. Funciona sin internet y la voz no sale del dispositivo.

**Progreso:** no afecta las cajas del repaso (hablar es más difícil que reconocer). Se guarda aparte qué palabras dijo bien y qué días, y la zona de padres muestra "Dijo en voz alta: N palabras".

**Zona de padres:** modo de hablar **Automático / Grabar y escucharse / Apagado**, con este aviso: en Chrome la voz se procesa en los servidores de Google; en "Grabar y escucharse" no sale del dispositivo. Dispositivos: Android (Chrome) e iPad (Safari); el iPad se valida en el equipo real.

---

## 8. Diseño de interfaz para 5 años (y para la noche)

- Botones de mínimo 80–100 px, bien separados; toques con tolerancia.
- Horizontal en tablet; vertical funcional en celular.
- Sin menús ni instrucciones escritas: cada pantalla se explica sola con voz.
- Mascota guía (un perrito "Buddy") que habla y celebra.
- Botón 🔊 siempre visible para repetir la instrucción.
- **Tono nocturno:** colores suaves y fondos oscuros cálidos, sin destellos ni confeti explosivo; celebraciones con estrellas que aparecen despacio.
- **Zona de papá/mamá:** botón ⚙️ en el inicio + una suma de dos cifras (34 + 27). Ahí: elegir la lección (la de hoy o cualquier tema) y el tipo de juego (mezcla, Where is…?, frases, Find these two!), ver palabras vistas/aprendidas por tema, las misiones para casa y reiniciar un tema o todo (con doble toque de confirmación).
- Alto contraste en lo importante, sin parpadeos, volumen consistente entre audios.

---

## 9. Estructura del proyecto

```
EmmaIngles/
├── PLAN.md
├── package.json
├── vite.config.ts            # incluye vite-plugin-pwa
├── scripts/
│   └── generate-audio.ts     # TTS → mp3 (solo lo que falta) + ffmpeg
├── assets/
│   ├── audio-raw/            # originales de ElevenLabs (lo que costó créditos)
│   └── images-src/           # PNG de ChatGPT → se convierten a WebP en src/assets/images
├── public/
│   ├── audio/                # generado: audio/animals/dog.mp3 + manifest.json
│   └── icons/                # íconos de la PWA
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── screens/              # Home, Session, PuzzleScreen, GoodNight (estado simple en App.tsx, sin router)
│   ├── content/              # un archivo por tema + types.ts
│   ├── games/
│   │   ├── ListenTouch.tsx
│   │   ├── FindInScene.tsx
│   │   ├── Memory.tsx
│   │   ├── SimonSays.tsx
│   │   ├── DragDrop.tsx
│   │   └── Balloons.tsx
│   ├── components/           # Buddy, BigButton, AudioButton, Puzzle, NightCalendar
│   ├── lib/
│   │   ├── audio.ts          # Howler: precarga, secuencias, cortar al cambiar de paso
│   │   ├── progress.ts       # localStorage
│   │   ├── images.ts         # imágenes optimizadas, con emojis de respaldo
│   │   └── review.ts         # repaso espaciado (lógica pura, con pruebas)
│   └── styles/
├── Dockerfile                # build + Nginx para Coolify
└── deploy/
    └── nginx.conf            # caché: sw.js/index.html sin caché, /assets inmutable
```

---

## 10. Despliegue en el VPS (Coolify)

Detalle paso a paso en [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md).

1. Repo en GitHub (privado) → Coolify lo construye con el `Dockerfile` (Node para el build, Nginx en el puerto 80, config en `deploy/nginx.conf`).
2. Subdominio con registro A al VPS; Coolify gestiona el HTTPS (obligatorio para la PWA).
3. Cada `git push` a `main` redespliega.
4. En la tablet: abrir la URL → "Agregar a pantalla de inicio".

---

## 11. Fases de desarrollo

### Fase 0 — Preparación (1 tarde)
- [x] Proyecto React + TS + Vite con Howler, motion y vite-plugin-pwa
- [x] Repositorio Git
- [x] Voz elegida: **ElevenLabs** (`eleven_v4`, voz "Buddy")
- [x] `scripts/generate-audio.ts` + audios de **los 10 temas** (289 clips, ~4 MB)
- [ ] (Opcional) Grabar con tu voz: "Hello Emma!", "Great job, Emma!", "Good night, Emma!"

### Fase 1 — MVP jugable (1–2 fines de semana)
- [x] Pantalla de inicio con ▶️ + Buddy + saludo
- [x] Presentación de palabras del tema
- [x] Juego **Listen & Touch** (2 → 4 opciones)
- [x] Repaso espaciado básico (`review.ts`) y armado de la sesión nocturna
- [x] **Rompecabezas:** ficha al final de cada sesión, Emma la coloca
- [x] Cierre "Good night, Emma!" y estilo nocturno
- [x] Temas Colors y Animals (el contenido y los audios de los 10 temas ya están)
- [x] PWA instalable y offline (precarga app + audios)
- [x] Desplegar en el VPS (Coolify) y probar en la tablet **con Emma**

### Fase 2 — Lecciones de 5–7 min y hablar
**Etapa A — más juegos**
- [ ] Lección armada por actividades (repaso → nuevas → juego 1 → Say it! → juego 2 → cierre), con rotación de juegos
- [ ] Memory
- [ ] Pop the Balloons
- [ ] Feed Buddy (arrastrar hasta Buddy)
- [ ] Frases nuevas de Buddy (pop, give me, your turn, try again…)

**Etapa B — hablar**
- [ ] Your turn! Say it! con reconocimiento automático y generoso
- [ ] Respaldo "grabar y escucharse"
- [ ] Ajuste de hablar en la zona de padres + "dijo en voz alta" en el progreso

**Etapa C — pulido**
- [ ] Modos de un solo juego en la zona de padres (Memory, Balloons, Feed Buddy, Say it!)
- [ ] Imágenes nuevas (`docs/IMAGENES-3.md`): Buddy con hambre, Buddy con micrófono, botón 🎤
- [x] Tarjetas ilustradas de las 63 palabras con su nombre escrito
- [x] Modo offline completo
- [x] Temas My body, Food, Numbers (contenido, audio e imágenes de los 10 temas)

### Fase 3 — Más contexto y zona de padres
- [x] Zona de padres: ⚙️ + suma de dos cifras; elegir tema y tipo de juego, ver progreso, misiones para casa, reiniciar
- [ ] Find it in the scene, Simon Says
- [ ] Rompecabezas completo que cobra vida + álbum
- [ ] Calendario de noches (racha) y mapa de islas
- [ ] Salida protegida a mitad de una lección (para papá/mamá)
- [ ] Opción para ocultar los nombres de las tarjetas en los juegos (si lee en vez de escuchar)

### Fase 4 — Ideas futuras
- [ ] Cuentos cortos interactivos con audio (buen cierre antes de dormir)
- [ ] Canciones con imágenes animadas
- [ ] Frases personales con la voz de papá/mamá ("Great job, Emma!")
- [ ] Sincronizar progreso entre dispositivos (backend pequeño en el VPS)

---

## 12. Cómo saber si funciona

- ¿Pide jugar cada noche? ¿Le emociona la ficha nueva? (lo más importante)
- **Palabras aprendidas** (acertadas a la primera en 3 días distintos), en la zona de padres, sin mostrárselas a ella.
- ¿Reconoce las palabras fuera del juego? ("Emma, where is the dog?")
- ¿Dice palabras en inglés espontáneamente? (suele tardar semanas; es normal).

---

## 13. Rutina sugerida en casa (complemento del juego)

- **Cada noche:** papá/mamá hace su Duolingo y Emma su sesión, uno al lado del otro (5–7 min).
- **Rutinas en inglés:** desayuno, baño o antes de dormir, con las palabras que está aprendiendo.
- **Misión para casa** del tema actual (aparece en la zona de padres).
- Un cuento o canción en inglés antes de dormir, 2–3 veces por semana.
