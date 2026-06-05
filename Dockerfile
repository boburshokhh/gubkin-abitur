# Шаг 1: Сборка Vue приложения
FROM node:18-alpine AS build-stage

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL=/api
ARG VITE_ADMISSION_OPEN=true
ARG APP_VERSION=local
ARG GIT_SHA=unknown
ARG BUILD_DATE=unknown

# Переменные окружения Vite читаются во время сборки frontend.
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ADMISSION_OPEN=$VITE_ADMISSION_OPEN
ENV VITE_APP_VERSION=$APP_VERSION
ENV VITE_GIT_SHA=$GIT_SHA
ENV VITE_BUILD_DATE=$BUILD_DATE

RUN npm run build

# Шаг 2: Раздача статики через Nginx
FROM nginx:alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

ARG APP_VERSION=local
ARG GIT_SHA=unknown
ARG BUILD_DATE=unknown
RUN printf '{"status":"ok","version":"%s","gitSha":"%s","buildDate":"%s"}\n' "$APP_VERSION" "$GIT_SHA" "$BUILD_DATE" > /usr/share/nginx/html/version.json

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
