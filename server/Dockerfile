FROM node:14-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build
RUN npm ci --only=production

FROM public.ecr.aws/lambda/nodejs:14

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

CMD ["./dist/lambda.handler"]
