ifeq (${ENV},)
	ENV := dev
endif

TEMP_ENV_FILE := $(shell mktemp -t ".env.XXXXXX")

$(eval _ := $(shell \
	find env -type f -name "*.env" -follow \
	| xargs awk 1 \
	| grep -ve "^\#" \
	>> ${TEMP_ENV_FILE} \
))

$(eval _ := $(shell \
	test -f .env && \
	cat .env \
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

DOCKER_COMPOSE_COMMAND ?= docker-compose

DOCKER_COMPOSE = ${DOCKER_COMPOSE_COMMAND} $(1)
DOCKER_COMPOSE_RUN = ${DOCKER_COMPOSE_COMMAND} run --user ${DOCKER_USER} $(1)
DOCKER_COMPOSE_EXEC = ${DOCKER_COMPOSE_COMMAND} exec --user ${DOCKER_USER} $(1)

start:
	@$(call DOCKER_COMPOSE, up)

stop:
	@$(call DOCKER_COMPOSE, stop)

db-client:
	@$(call DOCKER_COMPOSE_EXEC, \
		db mysql \
			--user=${MYSQL_USER} \
			--password=${MYSQL_PASSWORD} \
			--default-character-set=utf8mb4 \
			${MYSQL_DB} \
	)

db-import:
	@$(call DOCKER_COMPOSE_EXEC, \
			-T db mysql \
			--host=${MYSQL_HOST} \
			--user=${MYSQL_USER} \
			--password=${MYSQL_PASSWORD} \
			--default-character-set=utf8mb4 \
			${MYSQL_DB} \
	)

db-migrate:
	@$(call DOCKER_COMPOSE_RUN, --rm api migration:run)

db-rollback:
	@$(call DOCKER_COMPOSE_RUN, --rm api migration:revert)

db-generate-migration:
	@$(call DOCKER_COMPOSE_RUN, --rm api migration:generate)
