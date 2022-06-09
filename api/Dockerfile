FROM node:16.15-alpine3.15

WORKDIR /api

COPY www/package.json www/yarn.lock /api/

RUN yarn install

COPY www/. /api/

ENTRYPOINT [ "yarn" ]

CMD [ "start:dev" ]