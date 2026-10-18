FROM nginxinc/nginx-unprivileged:1.31.6-alpine
LABEL authors="Herman Ronk"

COPY nginx.conf /etc/nginx/conf.d/default.conf
# Uitvoerbaar via git (mode 755); het entrypoint slaat niet-uitvoerbare scripts over
COPY docker/40-umami.sh /docker-entrypoint.d/40-umami.sh
COPY index.html info.html favicon.ico /usr/share/nginx/html/
COPY css /usr/share/nginx/html/css
COPY inc /usr/share/nginx/html/inc
COPY beta /usr/share/nginx/html/beta

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
