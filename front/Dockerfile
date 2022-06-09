FROM node:15.11.0-alpine3.10 as base-image

RUN apk add curl;

RUN curl -sL https://unpkg.com/@pnpm/self-installer | node

WORKDIR /front_app

COPY www/package.json /front_app/package.json
COPY www/pnpm-lock.yaml /front_app/pnpm-lock.yaml

RUN pnpm install

COPY www/. /front_app/

VOLUME [ "/front_app/node_modules" ]

ENTRYPOINT [ "pnpm" ]

CMD [ "dev" ]