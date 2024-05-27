FROM ptcsmacr.azurecr.io/nginxinc/nginx-unprivileged:1.25.4-alpine
COPY nginx.conf /etc/nginx/nginx.conf
WORKDIR /usr/share/nginx/html
COPY dist/ .
