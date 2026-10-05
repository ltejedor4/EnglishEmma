# Emma English — Resumen de lo implementado

Estado al 4 de octubre de 2026. Plan original y fases en [PLAN.md](../PLAN.md).

**En línea:** https://englishkids.dedinerohablamos.com (PWA instalable, funciona sin internet).

---

## 1. Qué es

Un juego web para que Emma (5 años) aprenda inglés jugando cada noche, como "su propio Duolingo": al lado de papá/mamá, a su nivel, con un perrito guía (**Buddy**) que habla en inglés y una **ficha de rompecabezas** de premio al terminar cada noche.

## 2. Cómo se juega

1. **Inicio:** fondo nocturno, Buddy saluda y un botón ▶ grande. El primer toque también desbloquea el audio en tablets y celulares.
2. **Sesión de la noche:**
   - "Hello, Emma! Let's play!"
   - **Repaso** de palabras de días anteriores.
   - **Palabras nuevas:** cada una en una tarjeta grande con su ilustración, su nombre escrito y una frase ("Red." → "The apple is red."). Tocar la tarjeta la repite.
   - **Juego:** Buddy pide algo y Emma toca la tarjeta correcta. Mínimo 8 rondas.
3. **¡Ficha nueva! 🧩** Llega volando y Emma la arrastra a su lugar en el rompecabezas del tema (funciona con el dedo).
4. **"Good night, Emma! Sweet dreams!"** (voz cálida) y Buddy se duerme en su almohada.
5. Después aparecen el **▶ de práctica** (sin ficha) y el **⚙️ de padres**.

**Errores sin castigo:** la tarjeta se mueve suavemente, Buddy dice "Look, here it is!" con la palabra y la opción correcta brilla. Ningún sonido negativo.

## 3. Cómo aprende (repaso espaciado)

| Regla | Detalle |
|---|---|
| Cajas de Leitner | Cada palabra tiene una caja de 0 a 3; se repasa a los 0, 1, 2 o 4 días según la caja |
| Acierto / error | Acertar a la primera la sube de caja (una vez por día como máximo); un error la devuelve a la caja 0 |
| "Aprendida" | Acertada a la primera en **3 días distintos** (se ve en la zona de padres) |
| Palabras nuevas | 3 por sesión; menos si le está costando; **máximo 6 por día** |
| Avance de tema | El siguiente tema se abre cuando ya vio todo el actual y acierta la mayoría |
| Opciones por ronda | Según cuánto la sabe: 2 → 3 → 4 tarjetas; los distractores son palabras que ya conoce |
| Variedad | Todo repaso tiene **al menos 3 palabras distintas**; una palabra sale **máximo 3 veces** por sesión y **nunca dos veces seguidas** |

**Tres formas de preguntar** (se mezclan en cada sesión):
- 👆 **Where is…?** — "Where is the dog?" / "Find the red one!"
- 👂 **Frases** — "The sky is blue." → encontrar el azul (comprensión en contexto; solo frases que nombran una única palabra del tema)
- ✌️ **Find these two!** — "Red… and… blue" → tocar las dos

## 4. Recompensas

- **Rompecabezas:** una ficha por noche (6 por tema), con la ilustración del tema. La primera sesión del día da la ficha; las prácticas no.
- **Práctica libre:** después de la sesión de la noche se puede seguir jugando. Si va bien, también trae palabras nuevas (dentro del tope diario); si le cuesta, solo repaso.

## 5. Zona de papá y mamá (⚙️)

- Protegida con una **suma de dos cifras** (cambia si se responde mal).
- **Elegir la lección:** la automática de hoy o **cualquiera de los 10 temas**, aunque no esté desbloqueado.
- **Elegir el tipo de juego:** mezcla, Where is…?, frases o Find these two!
- **Progreso por tema:** palabras vistas y aprendidas.
- **Misión para casa:** frases del tema para usar con ella en la rutina.
- **Reiniciar** un tema o todo (palabras, fichas y noches), con doble toque de confirmación.

## 6. Contenido

10 temas, **63 palabras**, cada una con 4 audios (palabra, pregunta y 2 frases de contexto):

| Tema | Palabras |
|---|---|
| Colors | red, blue, yellow, green, pink, orange |
| Animals | dog, cat, fish, bird, cow, lion |
| My body | head, eyes, nose, mouth, hands, feet |
| Food | apple, banana, milk, bread, egg, water |
| Numbers | one … ten |
| Toys | ball, doll, car, teddy bear, blocks, train |
| Family | mom, dad, **sister (MaLu)**, grandma, grandpa |
| Actions | jump, run, sit, clap, dance, sleep |
| Clothes | shirt, shoes, hat, socks, pants, jacket |
| Feelings | happy, sad, angry, tired, scared, surprised |

Además, 29 frases comunes de Buddy: saludos, 6 celebraciones distintas, ayudas tras un error, instrucciones y el cierre nocturno. El contenido vive en `src/content/` (un archivo por tema).

## 7. Audio

- **Voz:** ElevenLabs, modelo `eleven_v4`, voz diseñada **"Buddy"** (infantil, con buena pronunciación). Elegida frente a las voces de Microsoft (edge-tts).
- **291 clips**, generados una sola vez con `npm run audio`. Pesan **4.1 MB** en total (mp3 mono 64 kbps, silencios recortados y volumen normalizado).
- Costo total: unos 4.600 caracteres, alrededor de USD 0,10 al precio de v4.
- El script solo genera lo que falta o cambió. Los originales quedan en `assets/audio-raw/` para reprocesarlos sin pagar de nuevo.
- Las etiquetas de tono (`[cheerfully]`, `[calmly]`, `[warmly]`) dan la emoción; `[softly]` se reemplazó porque sonaba a susurro.
- Nunca suenan dos audios a la vez: un audio nuevo corta el anterior, incluso si estaba cargando.

## 8. Imágenes

Generadas con ChatGPT / Codex siguiendo [IMAGENES.md](IMAGENES.md) y [IMAGENES-2.md](IMAGENES-2.md), y convertidas a WebP con `npm run images`. Son **102 imágenes** en el juego:

| Tipo | Cantidad | Uso |
|---|---|---|
| Buddy | 7 poses + 1 genérico | saluda, escucha, señala, celebra, ficha, bosteza, duerme |
| Rompecabezas / escenas | 10 | uno por tema |
| Tarjetas de palabras | 63 | todas las palabras, con su nombre en inglés debajo |
| Fondos | 2 | noche (inicio) y mapa de islas (pendiente de usar) |
| Íconos de temas | 10 | zona de padres (y luego el mapa) |
| Globos, reverso de carta, stickers | 9 | para los juegos de la Fase 2 |

Ícono de la app: la cara de Buddy, con una versión "maskable" con margen para Android.

## 9. Tecnología

| Pieza | Elección |
|---|---|
| App | React 19 + TypeScript + Vite 8 |
| Estilos | Tailwind CSS v4 (colores del juego como tokens del tema) |
| Animaciones / arrastrar | `motion` |
| Audio | Howler.js |
| PWA | `vite-plugin-pwa`: precarga app, audios e imágenes (~8,5 MB) para jugar sin internet |
| Progreso | `localStorage` en la tablet (sin backend ni cuentas) |
| Despliegue | Dockerfile (Node → Nginx) en Coolify |

```
src/
├── content/     temas, palabras y frases (texto → de aquí salen los audios)
├── lib/         lógica pura: review.ts (repaso espaciado), session.ts (armado de la sesión),
│                audio.ts, progress.ts, images.ts, lesson.ts
├── games/       ListenTouch (los 3 tipos de pregunta), Presentation
├── screens/     Home, Session, PuzzleScreen, ParentGate, ParentZone
└── components/  Buddy, WordImage/WordCaption, Screen, botones, estrellas
scripts/         generate-audio.ts, optimize-images.ts, extract-buddy.ts
deploy/          nginx.conf
```

## 10. Cómo se verificó

- **25 pruebas automáticas** (`npm test`) de la lógica de aprendizaje: intervalos, desbloqueo, tope diario, el caso "solo yellow", y 200 sesiones al azar en los 4 modos que verifican que no haya palabras repetidas seguidas, ninguna pase de 3 veces y la respuesta correcta siempre esté entre las opciones.
- **Pruebas en navegador** (Edge controlado por script) durante el desarrollo:
  - sesión completa, práctica y segunda noche;
  - celular vertical y horizontal con **toques reales**, incluido arrastrar la ficha;
  - zona de padres y reinicios;
  - modo **sin internet**;
  - **la imagen Docker** antes de desplegar: así se detectó y corrigió un error de tipos de archivo en Nginx que habría dejado la app en blanco.

  Estos scripts no están en el repositorio.

## 11. Despliegue

Detalle en [DESPLIEGUE.md](DESPLIEGUE.md). En resumen: `git push` a `main` → Coolify construye con el `Dockerfile` (Nginx en el puerto 80) → publicado en `englishkids.dedinerohablamos.com` con HTTPS. `sw.js` e `index.html` van sin caché para que las actualizaciones lleguen; la tablet se actualiza sola al abrir la app con internet.

## 12. Comandos

```powershell
npm run dev        # desarrollo (abrir la URL de red en la tablet, misma WiFi)
npm test           # pruebas de la lógica
npm run build      # build de producción
npm run audio:dry  # ver qué audios faltan y cuánto costarían
npm run audio      # generar audios con ElevenLabs (requiere .env con la clave)
npm run images     # convertir assets/images-src/*.png → WebP e íconos de la PWA
```

## 13. Pendiente / próximos pasos

- **Revisar a ojo la última tanda de imágenes:** 23 tarjetas (Family, Actions, Clothes, Feelings), íconos de temas, globos y stickers. Ya están convertidas y en el juego, pero no pasaron por la revisión una por una que sí tuvo la primera tanda.
- **Fase 2 (juegos y contexto):** Find it in the scene, Memory, Simon Says, Pop the Balloons; rompecabezas completo que "cobra vida" (tocar cada objeto dice su palabra) y álbum; calendario de noches; mapa de islas.
- **Ideas que surgieron:**
  - salida protegida a mitad de una lección (para papá/mamá);
  - opción para ocultar los nombres de las tarjetas en los juegos, si notan que lee en vez de escuchar;
  - grabar con la voz de papá/mamá "Great job, Emma!".
- **Fase 4:** "Repeat after me" con micrófono, cuentos y canciones, sincronizar el progreso entre dispositivos.

## 14. Decisiones importantes

| Decisión | Motivo |
|---|---|
| React (no Vue ni Angular) | Ecosistema y ayuda disponibles; Angular es excesivo para un juego |
| Audios pregenerados, no TTS en vivo | Sin internet, sin costo por uso y sin exponer claves |
| ElevenLabs v4 | Más natural que edge-tts, y una voz propia para Buddy |
| Emma lo hace todo | Descartado un modo donde ella le pregunta a papá/mamá: "ella quiere hacer todo" |
| Una ficha por noche + práctica libre | Mantiene la emoción de la ficha diaria sin bloquear el juego |
| Voz `[warmly]` para la noche | `[softly]` sonaba a susurro y podía asustar |
| Nombre escrito en cada tarjeta | Emma ya reconoce letras: asocia sonido, imagen y palabra |
