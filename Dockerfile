FROM node:lts-alpine3.14

ADD . .

RUN npm install

ENTRYPOINT npm run start:cron
