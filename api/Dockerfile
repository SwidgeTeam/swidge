FROM node:16.15-alpine3.15

WORKDIR /api

COPY www/. /api/

RUN yarn install

VOLUME [ "/api/node_modules" ]

ENTRYPOINT [ "yarn" ]

CMD [ "start:dev" ]