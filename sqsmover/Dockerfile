FROM debian:stable-slim

RUN apt update && apt install -y curl && \
    curl https://raw.githubusercontent.com/mercury2269/sqsmover/master/install.sh | sh

ENTRYPOINT [ "sqsmover" ]