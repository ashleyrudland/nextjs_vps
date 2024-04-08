FROM node:20-alpine AS base

# Disabling Telemetry
ENV NEXT_TELEMETRY_DISABLED 1
RUN apk add --no-cache libc6-compat curl python3 py3-pip

FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/public ./public
RUN mkdir .next
RUN mkdir -p /data && chown -R nextjs:nodejs /data
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV=production

CMD ["node", "server.js"]