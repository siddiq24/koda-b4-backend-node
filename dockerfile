FROM node:25-alpine3.21 AS deps
WORKDIR /app

RUN apk add --no-cache python3 make g++ bash

COPY package.json package-lock.json ./
RUN npm install

FROM node:25-alpine3.21 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY . .

FROM node:25-alpine3.21 AS runner
WORKDIR /app

COPY --from=builder /app ./

CMD ["sh", "-c", "npx prisma generate && node index.js"]