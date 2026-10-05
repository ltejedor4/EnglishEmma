# Cómo agregar palabras, temas o imágenes

Todo el contenido sale de `src/content/`. Las voces se generan con ElevenLabs y las imágenes con Codex CLI, ambos desde scripts.

## Requisitos (una vez)

- `.env` con `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` y `ELEVENLABS_MODEL_ID` (ver `.env.example`).
- Codex CLI instalado y con sesión iniciada (`codex login`). El script lo busca en el PATH, en `%LOCALAPPDATA%\Programs\OpenAI\Codex\bin\codex.exe` o en la variable `CODEX_BIN`.

## Agregar una palabra

1. **Contenido:** agregarla al tema en `src/content/<tema>.ts`:
   ```ts
   { id: 'horse', image: '🐴', say: 'Horse.', ask: 'Where is the horse?', facts: ['The horse can run.', 'The horse says neigh!'] },
   ```
   Opcionales:
   - `sounds: ['hors']` → lo que el reconocedor de voz suele entender (homófonos, acento), para "Say it!".
   - `picture: 'brown horse with a white mane'` → cómo dibujar la tarjeta, si la descripción por defecto no alcanza.
2. **Voz:**
   ```powershell
   npm run audio:dry   # qué falta y cuántos caracteres cuesta
   npm run audio       # genera solo lo que falta
   ```
   Escuchar el resultado en `audio-preview.html`.
3. **Imagen:**
   ```powershell
   npm run images:missing             # qué tarjetas faltan
   npm run images:generate -- --missing
   npm run images                     # convierte a WebP
   ```
   Revisar cada imagen antes del commit: mismo estilo, sin letras y, en los números, la cantidad correcta.
4. `npm test` y `npm run build` → commit → push → Coolify despliega.

## Cómo se dibuja cada tipo de tarjeta

`scripts/generate-images.ts` elige el pedido según el tema, igual que en `docs/IMAGENES-2.md`:

| Tema | Dibujo | Referencia adjunta |
|---|---|---|
| Colors | mancha de pintura del color, con carita | Buddy (estilo) |
| Numbers | N estrellas sonrientes para contar | Buddy (estilo) |
| Actions | Buddy haciendo la acción | Buddy |
| Feelings | la cara de Buddy con esa emoción | Buddy |
| Family | retrato del personaje de la escena | `puzzle-family.png` |
| Demás temas | el objeto, igual que en la escena | `puzzle-<tema>.png` |

## Otras imágenes (poses de Buddy, íconos…)

```powershell
npm run images:generate -- buddy-sad --prompt "sitting, sad, a single tear"
npm run images:generate -- mic-button --prompt "a big round friendly toy microphone icon..."
npm run images:generate -- word-animals-dog --dry-run   # ver el pedido sin generar
```

- Las poses de Buddy que usa el juego están en `src/lib/pose.ts`. Si falta la imagen de alguna, `images:missing` la lista.
- Codex corre limitado a esta carpeta y se le pide tocar solo el archivo pedido. El script verifica con git que no haya cambiado nada más y avisa si pasa.
- Cada imagen tarda 1–2 minutos y consume del cupo del plan de ChatGPT.

## Agregar una pregunta para conversar

En `questions` de un tema (por ejemplo `src/content/hello.ts`):

```ts
{
  id: 'pet',
  image: '🐾',
  ask: 'Do you have a pet?',
  answer: 'Yes, I have a dog.',
  accepts: { kind: 'yesno' },          // o { kind: 'words', words: ['dog'] } · { kind: 'number' } · { kind: 'topic', topicId: 'colors' }
  picture: 'a cute puppy and a kitten sitting together',   // para su ilustración (o imageName: 'word-animals-dog')
},
```

Después: `npm run audio` (pregunta y respuesta modelo) y `npm run images:generate -- --missing` (ilustración `q-<tema>-<id>`). Aparece sola en "Your turn! Say it!".

## Agregar un tema nuevo

1. Crear `src/content/<tema>.ts` (copiar uno existente) y sumarlo a `src/content/index.ts`: en `topics` donde corresponda en el orden de avance, y en `puzzleTopics` **al final** (así no cambia el rompecabezas que Emma está armando).
2. Pedir su escena/rompecabezas: `npm run images:generate -- puzzle-<tema> --prompt "..."` (ver la plantilla en `docs/IMAGENES.md`). Conviene generarla **antes** que las tarjetas, porque las tarjetas la usan como referencia.
3. Seguir los pasos de "Agregar una palabra".
