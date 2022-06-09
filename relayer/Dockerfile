FROM node:16.15-alpine3.15

WORKDIR /relayer

COPY www/package.json www/yarn.lock /relayer/

RUN yarn install

COPY www/. /relayer/

