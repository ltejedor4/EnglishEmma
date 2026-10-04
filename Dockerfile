# Emma English: build estático con Vite, servido por Nginx. Pensado para Coolify (puerto 80).

FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
# --ignore-scripts: evita descargar ffmpeg-static (~80 MB), que solo se usa en el PC para generar
# audios e imágenes. Los audios y las imágenes ya optimizadas vienen en el repositorio.
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://127.0.0.1/ || exit 1
