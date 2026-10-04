# Despliegue en el VPS con Coolify

La app es 100 % estática: Coolify construye la imagen con el `Dockerfile` del repositorio (Node para el build, Nginx para servirla en el puerto 80) y se encarga del dominio y del HTTPS.

> **No hace falta ninguna variable de entorno.** La clave de ElevenLabs solo se usa en tu PC para generar audios; los audios ya van en el repositorio y el `.env` nunca se sube.

## 1. Subir el repositorio a GitHub (una sola vez)

Coolify construye desde Git. Crea un repositorio **privado** vacío en GitHub (sin README) y en la carpeta del proyecto:

```powershell
git remote add origin https://github.com/<tu-usuario>/emma-english.git
git push -u origin main
```

(El repo pesa ~60 MB por los audios e ilustraciones originales; ningún archivo pasa de 3 MB, GitHub lo acepta sin problema.)

## 2. DNS

En tu proveedor de dominio, un registro **A** del subdominio que elijas (ej. `emma.tudominio.com`) apuntando a la IP del VPS.

> **Elige el dominio definitivo antes de que Emma empiece a jugar.** El progreso (palabras, fichas del rompecabezas) se guarda en la tablet asociado al dominio: si después cambia, empieza de cero.

## 3. Crear la aplicación en Coolify

1. **Projects → (tu proyecto) → + New → Private Repository (with GitHub App)**.
   Si todavía no conectaste GitHub, Coolify te guía para instalar su GitHub App y darle acceso solo a este repo.
2. Elige el repo `emma-english`, rama `main`.
3. **Build Pack: `Dockerfile`** (no Nixpacks).
4. **Ports Exposes: `80`**.
5. **Domains:** `https://emma.tudominio.com` (con `https://`, así Coolify pide el certificado de Let's Encrypt).
6. **Deploy.** El primer build tarda 1–3 minutos.

Con la GitHub App, cada `git push` a `main` vuelve a desplegar solo.

## 4. Comprobar

- Abre `https://emma.tudominio.com`: debe verse Buddy y el ▶.
- `https://emma.tudominio.com/sw.js` debe responder con `Cache-Control: no-cache` (así llegan las actualizaciones).
- En las DevTools del navegador (Application → Service Workers) debe aparecer el service worker activo.

## 5. Instalar en la tablet

- **Android (Chrome):** abrir la URL → menú ⋮ → **Instalar aplicación** / **Agregar a pantalla principal**.
- **iPad / iPhone (Safari):** abrir la URL → botón Compartir → **Agregar a pantalla de inicio**.

Ábrela una vez con internet: se descarga todo (~7 MB) y desde ahí funciona sin conexión.

## 6. Actualizaciones

1. Cambios en el PC → `git push`.
2. Coolify reconstruye y publica.
3. En la tablet, la app se actualiza sola la próxima vez que se abre con internet (a veces hace falta cerrarla y abrirla una segunda vez).

El progreso de Emma **no se pierde** con las actualizaciones: vive en la tablet, no en el servidor.
