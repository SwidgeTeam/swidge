ifeq (${ENV},)
	ENV := dev
endif

TEMP_ENV_FILE := $(shell mktemp -t ".env.XXXXXX")

$(eval _ := $(shell \
	find env -type f -name "*.env" -follow \
	| xargs cat \
	| grep -ve "^\#" \
	>> ${TEMP_ENV_FILE} \
))

-include ${TEMP_ENV_FILE}

ENV_KEYS := $(shell ( \
	cat ${TEMP_ENV_FILE} \
	| sed -E 's/^([A-Za-z][A-Za-z0-9_-]*)\s*\??:??=\s*(.*)/\1/' \
	| sort -u \
))

export ${ENV_KEYS}

DOCKER_USER ?= $(shell id -u)

DOCKER-COMPOSE = docker-compose $(1)

start:
	@$(call DOCKER-COMPOSE, up)

stop:
	@$(call DOCKER-COMPOSE, stop)