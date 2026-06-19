FROM node:22-alpine

WORKDIR /app

ARG APP_VERSION=local
ARG GIT_SHA=unknown
ARG BUILD_DATE=unknown

COPY package*.json ./

RUN npm install --omit=dev

COPY src ./src

ENV PORT=3000
ENV NODE_ENV=production
ENV APP_VERSION=$APP_VERSION
ENV GIT_SHA=$GIT_SHA
ENV BUILD_DATE=$BUILD_DATE

EXPOSE 3000

CMD ["node", "src/index.js"]
