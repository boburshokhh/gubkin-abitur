# Шаг 1: Сборка Vue приложения
FROM node:18-alpine AS build-stage

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Переменная окружения для указания API эндпоинта во время сборки
# Так как Nginx проксирует запросы /api на бэкенд, мы можем использовать /api относительно текущего домена
ENV VITE_API_URL=/api
ENV VITE_ADMISSION_OPEN=true

RUN npm run build

# Шаг 2: Раздача статики через Nginx
FROM nginx:alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
