# Шаг 1: Сборка Vue приложения
FROM node:18-alpine AS build-stage

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL=/api
ARG VITE_ADMISSION_OPEN=true

# Переменные окружения Vite читаются во время сборки frontend.
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ADMISSION_OPEN=$VITE_ADMISSION_OPEN

RUN npm run build

# Шаг 2: Раздача статики через Nginx
FROM nginx:alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
