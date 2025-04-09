FROM node:20-alpine as build

WORKDIR /app

# Копирование файлов зависимостей
COPY package*.json ./

# Установка зависимостей
RUN npm ci

# Копирование исходного кода
COPY . .

# Сборка для продакшена
RUN npm run build

# Использование nginx для раздачи собранного приложения
FROM nginx:alpine

# Копирование собранного приложения
COPY --from=build /app/dist /usr/share/nginx/html

# Копирование nginx конфигурации
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Настройка порта
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 