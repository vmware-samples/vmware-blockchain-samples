FROM node:14

WORKDIR /app

COPY scripts ./scripts
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN ./scripts/init.sh

EXPOSE 7545
