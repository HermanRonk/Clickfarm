FROM nginxinc/nginx-unprivileged:1.30.5-alpine
LABEL authors="Herman Ronk"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html favicon.ico /usr/share/nginx/html/
COPY css /usr/share/nginx/html/css
COPY inc /usr/share/nginx/html/inc

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
