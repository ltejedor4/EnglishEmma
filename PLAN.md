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
| Arrastrar | `@dnd-kit/core` | Colocar fichas del rompecabezas, Drag & Drop con el dedo |
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

## 7. Mini-juegos

Todos reutilizan el mismo contenido de cada tema.

1. **Listen & Touch (el núcleo).** La voz dice "Where is the dog?" y aparecen 2–4 imágenes; Emma toca la correcta. Empieza con 2 opciones y sube a 4.
2. **Find it in the scene.** Una escena (casa, granja, cocina) y la voz pide "Find the **cat**!". Da el contexto que falta en Duolingo.
3. **Memory.** Cartas boca abajo; al voltear, cada carta *dice* su palabra. Emparejar iguales.
4. **Simon Says.** La mascota da órdenes ("Simon says: clap your hands!") y Emma las hace de verdad; ella misma toca ✅ al terminar. Ideal para "My body" y "Actions".
5. **Drag & Drop.** "Put the **apple** in the basket", "Give the **bone** to the dog".
6. **Pop the Balloons.** Suben globos de colores; la voz dice "Pop the **blue** balloon!".
7. **Repeat after me (fase posterior).** Botón de micrófono: Emma repite la palabra y escucha su propia grabación (sin calificar pronunciación).

### Flujo de una sesión nocturna (5–7 min)
1. Botón ▶️ grande → Buddy: "Hello Emma!" + su calendario de noches.
2. **Repaso:** Listen & Touch con palabras de días anteriores.
3. **Palabras nuevas:** presentación dentro de una escena (toca para escuchar) → 1–2 mini-juegos.
4. **¡Ficha nueva!** 🧩 Emma la coloca en su rompecabezas.
5. Estrellita en el calendario → Buddy bosteza: "Good night, Emma!" 🌙 y la sesión termina.

---

## 8. Diseño de interfaz para 5 años (y para la noche)

- Botones de mínimo 80–100 px, bien separados; toques con tolerancia.
- Horizontal en tablet; vertical funcional en celular.
- Sin menús ni instrucciones escritas: cada pantalla se explica sola con voz.
- Mascota guía (un perrito "Buddy") que habla y celebra.
- Botón 🔊 siempre visible para repetir la instrucción.
- **Tono nocturno:** colores suaves y fondos oscuros cálidos, sin destellos ni confeti explosivo; celebraciones con estrellas que aparecen despacio.
- **Zona de papá/mamá:** se entra manteniendo presionado 3 s o resolviendo una suma simple. Ahí: palabras aprendidas, progreso, misiones para casa, reiniciar.
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
├── public/
│   ├── audio/                # generado: audio/animals/dog.mp3 + manifest.json
│   ├── images/
│   │   ├── scenes/
│   │   └── puzzles/
│   └── icons/                # íconos de la PWA
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── router.tsx            # Inicio / Mapa / Sesión / Rompecabezas / Padres
│   ├── content/              # un archivo por tema + types.ts
│   ├── games/
│   │   ├── ListenTouch.tsx
│   │   ├── FindInScene.tsx
│   │   ├── Memory.tsx
│   │   ├── SimonSays.tsx
│   │   ├── DragDrop.tsx
│   │   └── Balloons.tsx
│   ├── components/           # Buddy, BigButton, AudioButton, Puzzle, NightCalendar
│   ├── hooks/
│   │   ├── useAudio.ts       # Howler: precarga y reproducción
│   │   └── useProgress.ts    # localStorage
│   ├── lib/
│   │   ├── review.ts         # repaso espaciado (lógica pura)
│   │   └── session.ts        # arma la sesión de la noche
│   └── styles/
└── deploy/
    ├── Caddyfile
    └── deploy.ps1            # build + subida al VPS desde Windows
```

---

## 10. Despliegue en el VPS

1. Subdominio apuntando al VPS (ej. `emma.tudominio.com`). **HTTPS es obligatorio** para instalar la PWA.
2. Instalar Caddy en el VPS con este `Caddyfile`:
   ```
   emma.tudominio.com {
       root * /var/www/emma
       try_files {path} /index.html
       file_server
       encode gzip
   }
   ```
3. En tu PC: `npm run build` → genera `dist/`.
4. Subir: `scp -r dist/* usuario@vps:/var/www/emma/` (o `rsync`, o WinSCP).
5. En la tablet: abrir la URL en Chrome/Safari → "Agregar a pantalla de inicio".
6. Opcional después: GitHub Actions que haga build y deploy en cada push.

> Si ya usas Docker en el VPS: contenedor `caddy:alpine` sirviendo `dist/`.

---

## 11. Fases de desarrollo

### Fase 0 — Preparación (1 tarde)
- [ ] `npm create vite@latest` (React + TS); instalar Howler, vite-plugin-pwa, motion, @dnd-kit/core
- [ ] Repositorio Git
- [ ] Elegir voz TTS (probar 2–3 servicios con las mismas frases y escucharlas con Emma)
- [ ] `scripts/generate-audio.ts` + audios de **Colors** y **Animals**
- [ ] Grabar con tu voz: "Hello Emma!", "Great job, Emma!", "Good night, Emma!"

### Fase 1 — MVP jugable (1–2 fines de semana)
- [ ] Pantalla de inicio con ▶️ + Buddy + saludo
- [ ] Presentación de palabras del tema
- [ ] Juego **Listen & Touch** (2 → 4 opciones)
- [ ] Repaso espaciado básico (`review.ts`) y armado de la sesión nocturna
- [ ] **Rompecabezas:** ficha al final de cada sesión, Emma la coloca
- [ ] Cierre "Good night, Emma!" y estilo nocturno
- [ ] Temas Colors y Animals
- [ ] PWA instalable (por el `localStorage`)
- [ ] Desplegar en el VPS y probar en la tablet **con Emma**

### Fase 2 — Más juegos y contexto
- [ ] Find it in the scene, Memory, Simon Says, Pop the Balloons
- [ ] Rompecabezas completo que cobra vida + álbum
- [ ] Calendario de noches (racha)
- [ ] Mapa de temas con desbloqueo por palabras aprendidas
- [ ] Modo offline completo
- [ ] Temas My body, Food, Numbers

### Fase 3 — Zona de padres y pulido
- [ ] Zona de padres (palabras aprendidas + misiones para casa)
- [ ] Drag & Drop
- [ ] Resto de temas

### Fase 4 — Ideas futuras
- [ ] "Repeat after me" con micrófono
- [ ] Cuentos cortos interactivos con audio (buen cierre antes de dormir)
- [ ] Canciones con imágenes animadas
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
