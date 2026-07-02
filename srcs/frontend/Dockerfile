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

CMD     ["nginx", "-g", "daemon off;"]
