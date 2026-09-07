# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /workspace

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
# Tailwind/PostCSS uses lightningcss; Alpine requires its musl native optional
# package to be installed explicitly in the dependency layer.
RUN --mount=type=cache,id=card-credit-frontend-npm,target=/root/.npm npm ci --include=optional

FROM node:22-alpine AS builder
WORKDIR /workspace

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /workspace/node_modules ./node_modules
COPY . .
RUN npm run prepare:card-images
RUN npm run build
RUN npm prune --omit=dev && npm cache clean --force

FROM node:22-alpine AS otel-deps
WORKDIR /otel
COPY otel/package.json otel/package-lock.json ./
RUN --mount=type=cache,id=card-credit-frontend-otel-npm,target=/root/.npm npm ci --omit=dev && npm cache clean --force

FROM nginx:alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
ENV NODE_OPTIONS="--experimental-loader=@opentelemetry/instrumentation/hook.mjs --import @opentelemetry/auto-instrumentations-node/register"

RUN apk add --no-cache nodejs \
  && addgroup -S nextjs && adduser -S nextjs -G nextjs \
  && mkdir -p /run/nginx /var/lib/nginx /var/cache/nginx \
  && chown -R nextjs:nextjs /run/nginx /var/lib/nginx /var/cache/nginx

COPY --chown=nextjs:nextjs --from=builder /workspace/.next/standalone ./
COPY --chown=nextjs:nextjs --from=builder /workspace/.next/static ./.next/static
COPY --chown=nextjs:nextjs --from=builder /workspace/public ./public
# The standalone server does not include packages loaded through NODE_OPTIONS.
# Keep only the auto-instrumentation runtime dependency closure available at startup.
COPY --chown=nextjs:nextjs --from=otel-deps /otel/node_modules ./node_modules
COPY --chown=nextjs:nextjs nginx.conf /etc/nginx/nginx.conf
COPY --chown=nextjs:nextjs start.sh /app/start.sh

USER nextjs
EXPOSE 3000

CMD ["/app/start.sh"]
