# Install dependencies and compile TypeScript to JavaScript
FROM    node:24-alpine AS builder

WORKDIR /app

COPY    package.json ./
RUN     npm install

COPY    . .
RUN     npm run build

# Copy compiled output from builder and run the app with production deps only
FROM    node:24-alpine AS runner

WORKDIR /app

COPY	package.json ./
RUN		npm install --omit=dev

COPY	--from=builder /app/dist ./dist

EXPOSE	3000

CMD		["npm", "start"]
