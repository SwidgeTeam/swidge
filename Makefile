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

REMOVE_TEMP_ENV_FILE := $(shell unlink ${TEMP_ENV_FILE})

DOCKER_USER ?= $(shell id -u)
DOCKER_COMPOSE_COMMAND ?= docker-compose

DOCKER_COMPOSE = ${DOCKER_COMPOSE_COMMAND} $(1)
DOCKER_COMPOSE_RUN = ${DOCKER_COMPOSE_COMMAND} run --user ${DOCKER_USER} $(1)
DOCKER_COMPOSE_EXEC = ${DOCKER_COMPOSE_COMMAND} exec --user ${DOCKER_USER} $(1)

DOCKER_COMMAND ?= docker
DOCKER = ${DOCKER_COMMAND} $(1)

### State management

up:
	@$(call DOCKER_COMPOSE, up --detach)

start:
	@$(call DOCKER_COMPOSE, start)

stop: down
down:
	@$(call DOCKER_COMPOSE, stop)

restart:
	@$(call DOCKER_COMPOSE, restart)

rm:
	@$(call DOCKER_COMPOSE, rm --force -v)

build:
	@$(call DOCKER_COMPOSE, build)

create:
	@$(call DOCKER_COMPOSE, up --no-start)

logs:
	@$(call DOCKER_COMPOSE, logs --follow)

$(addprefix build-, ${MAKE_APP_SERVICES}): build-%:
	@$(call DOCKER_COMPOSE, build $*)

$(addprefix create-, ${MAKE_APP_SERVICES}): create-%:
	@$(call DOCKER_COMPOSE, up --no-start $*)

$(addprefix start-, ${MAKE_APP_SERVICES}): start-%:
	@$(call DOCKER_COMPOSE, up -d $*)

$(addprefix stop-, ${MAKE_APP_SERVICES}): stop-%:
	@$(call DOCKER_COMPOSE, stop $*)

$(addprefix kill-, ${MAKE_APP_SERVICES}): kill-%:
	@$(call DOCKER_COMPOSE, kill $*)

$(addprefix restart-, ${MAKE_APP_SERVICES}): restart-%:
	@$(call DOCKER_COMPOSE, restart $*)

$(addprefix rm-, ${MAKE_APP_SERVICES}): rm-%:
	@$(call DOCKER_COMPOSE, rm --force -v $*)

$(addprefix fuck-, ${MAKE_APP_SERVICES}): fuck-%: \
	stop-% rm-% build-% create-% start-%

$(addsuffix -sh, ${MAKE_APP_SERVICES}): %-sh:
	@$(call DOCKER_COMPOSE, exec $* sh)

$(addsuffix -logs, ${MAKE_APP_SERVICES}): %-logs:
	@$(call DOCKER_COMPOSE, logs --follow $*)

setup: db-migrate set-networks-file compile-contracts

fuck: stop rm build create start

off: up logs

### Database

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

db-upgrade: db-migrate
db-migrate:
	@$(call DOCKER_COMPOSE_RUN, --rm api migration:run)

db-rollback:
	@$(call DOCKER_COMPOSE_RUN, --rm api migration:revert)

db-generate-migration:
	@$(call DOCKER_COMPOSE_RUN, --rm api migration:generate)

### Localstack

AWS_CLI = \
	@$(call DOCKER, run \
		--network ${DOCKER_NETWORK_NAME} \
		--rm -it \
		-e "AWS_DEFAULT_REGION=${AWS_SQS_REGION}" \
		-e "AWS_ACCESS_KEY_ID=${AWS_SQS_ACCESS_KEY}" \
		-e "AWS_SECRET_ACCESS_KEY=${AWS_SQS_SECRET}" \
		amazon/aws-cli \
		--endpoint-url=http://${DOCKER_LOCALSTACK_SERVICE}:${LOCALSTACK_PORT} \
		$(1) \
	)

create-queue:
	@$(call AWS_CLI, sqs create-queue --queue-name ${AWS_SQS_QUEUE_NAME} --attributes '{"FifoQueue": "True"}')

list-queues:
	@$(call AWS_CLI, sqs list-queues)

### Brownie

BROWNIE = $(call DOCKER_COMPOSE_RUN, --rm brownie $(1))

NAMED_BROWNIE = \
	@$(call DOCKER_COMPOSE_RUN, \
		--rm \
		--service-ports \
		--name ${BROWNIE_CONTAINER} \
		brownie $(1) \
	)

BROWNIE_DOCKER_EXEC = $(call DOCKER, exec -it ${BROWNIE_CONTAINER} $(1))
BROWNIE_RUN = $(call BROWNIE_DOCKER_EXEC, brownie run --network $(1) $(2))

BROWNIE_DEPLOY_ALL = $(call BROWNIE_RUN, $(1), scripts/tasks/deploy_all.py)
BROWNIE_GET_COINS = $(call BROWNIE_RUN, $(1), scripts/tasks/steal-coins.py)
BROWNIE_GET_TOKENS = $(call BROWNIE_RUN, $(1), scripts/tasks/steal-tokens.py main $(2))

set-networks-file:
	@$(call BROWNIE, cp network-config.yaml ${BROWNIE_USER_HOME}/.brownie/network-config.yaml)

compile-contracts:
	@$(call BROWNIE, brownie compile --all)

brownie-bash:
	@$(call BROWNIE, bash)

$(addprefix fork-, ${BROWNIE_NETWORKS}): fork-%:
	@$(call NAMED_BROWNIE, brownie console --network $*-fork)

$(addprefix deploy-all-fork-, ${BROWNIE_NETWORKS}): deploy-all-fork-%:
	@$(call BROWNIE_DEPLOY_ALL,$*-fork)

get-coins:
	@$(call BROWNIE_GET_COINS, local)

$(addprefix get-tokens-, ${BROWNIE_NETWORKS}): get-tokens-%:
	@$(call BROWNIE_GET_TOKENS,$*-fork,$(TOKEN))

### Relayer

relayer-events: create-queue
	@$(call DOCKER_COMPOSE_RUN, --rm relayer run:dev:events)

relayer-consumer:
	@$(call DOCKER_COMPOSE_RUN, --rm relayer run:dev:consumer)
