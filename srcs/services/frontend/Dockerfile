# Build Vite app
FROM    node:24-alpine AS builder

WORKDIR /app

COPY    app/package.json ./
RUN     npm install

COPY    app/ .
RUN     npm run build

# Serve static files with nginx
FROM    nginx:alpine AS runner

COPY    --from=builder /app/dist /usr/share/nginx/html

EXPOSE  80

HEALTHCHECK --interval=5s --timeout=3s --retries=10 --start-period=15s \
	CMD nc -z 127.0.0.1 80 || exit 1

CMD     ["nginx", "-g", "daemon off;"]
