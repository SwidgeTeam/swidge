FROM node:16.15-alpine3.15

RUN apk add curl git

WORKDIR /front_app

COPY www /front_app

RUN yarn install

VOLUME [ "/front_app/node_modules" ]

ENTRYPOINT [ "yarn" ]

CMD [ "dev" ]