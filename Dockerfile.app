# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /repo

COPY app/package*.json ./app/
RUN cd app && npm ci

COPY app ./app
COPY data ./data
COPY scripts ./scripts

ARG VITE_API_BASE_URL=http://localhost:3001
ARG VITE_BASE_PATH=/
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_BASE_PATH=${VITE_BASE_PATH}

RUN cd app && npm run build

FROM nginx:1.27-alpine AS runtime
COPY docker/nginx.app.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz >/dev/null || exit 1
