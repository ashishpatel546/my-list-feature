FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/database ./src/database
COPY --from=builder /app/src/entities ./src/entities
COPY --from=builder /app/src/common ./src/common

EXPOSE 3000

CMD ["node", "dist/main"]
