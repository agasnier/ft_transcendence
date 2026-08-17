# Install dependencies and compile TypeScript to JavaScript
FROM    node:24-alpine AS builder

WORKDIR /app

COPY    app/package.json ./
RUN     npm install

COPY    app/ .
RUN     npm run build

# Copy compiled output from builder and run the app with production deps only
FROM    node:24-alpine AS runner

WORKDIR /app

COPY	app/package.json ./
RUN		npm install --omit=dev

COPY	--from=builder /app/dist ./dist

# Migration SQL needed at runtime 
COPY	app/drizzle ./drizzle

# upload files save folder
RUN     mkdir -p /app/uploads && chown -R node:node /app/uploads

EXPOSE	3000

HEALTHCHECK --interval=1s --timeout=3s --retries=60 --start-period=15s \
	CMD nc -z 127.0.0.1 3000 || exit 1

USER	node

CMD		["npm", "start"]
