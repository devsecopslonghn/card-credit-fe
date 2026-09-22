# syntax=docker/dockerfile:1

FROM node:22-alpine@sha256:b6f26b36c8ff49624cfdac716b8ea1138d606df02586a77d364bb5536a634f85 AS deps
WORKDIR /workspace

COPY package.json package-lock.json ./
# Tailwind/PostCSS uses lightningcss; Alpine requires its musl native optional
# package to be installed explicitly in the dependency layer.
RUN --mount=type=cache,id=card-credit-frontend-npm,target=/root/.npm npm ci --include=optional

FROM node:22-alpine@sha256:b6f26b36c8ff49624cfdac716b8ea1138d606df02586a77d364bb5536a634f85 AS builder
WORKDIR /workspace

COPY --from=deps /workspace/node_modules ./node_modules
COPY . .
RUN npm run prepare:card-images
RUN npm run build
RUN npm cache clean --force

FROM nginxinc/nginx-unprivileged:1.29-alpine@sha256:0c79d56aee561a1d81c63f00eee5fb5fe29279560cdc55e91425133104c7fbe6 AS runner
USER root
RUN apk upgrade --no-cache
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/dist /usr/share/nginx/html
USER 101:101
EXPOSE 8080
