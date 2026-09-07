# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /workspace

COPY package.json package-lock.json ./
# Tailwind/PostCSS uses lightningcss; Alpine requires its musl native optional
# package to be installed explicitly in the dependency layer.
RUN --mount=type=cache,id=card-credit-frontend-npm,target=/root/.npm npm ci --include=optional

FROM node:22-alpine AS builder
WORKDIR /workspace

COPY --from=deps /workspace/node_modules ./node_modules
COPY . .
RUN npm run prepare:card-images
RUN npm run build
RUN npm cache clean --force

FROM nginx:alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/dist /usr/share/nginx/html
EXPOSE 80
