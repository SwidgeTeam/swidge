FROM node:16.15-alpine3.15

RUN apk add git

# Set up code directory
RUN mkdir /code
WORKDIR /code

COPY www/. /code/

RUN yarn install

VOLUME [ "/code/node_modules" ]
VOLUME [ "/code/build" ]

ENTRYPOINT [ "yarn" ]