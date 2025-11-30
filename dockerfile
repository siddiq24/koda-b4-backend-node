FROM node:25-alpine3.21 AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

FROM node:25-alpine3.21 AS build

WORKDIR /app

COPY . .

RUN npx prisma generate
COPY --from=deps /app/node_modules ./node_modules

FROM node:25-alpine3.21 AS prod

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app ./

EXPOSE 3000

CMD ["node", "index.js"]