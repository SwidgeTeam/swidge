ENV ?= dev

TEMP_ENV_FILE := $(shell mktemp -t ".env.XXXXXX")

$(foreach env, default ${ENV}, $(eval _ := $(shell \
	find env/${env} -type f -name "*.env" -follow \
	| xargs awk 1 \
	| grep -ve "^\#" \
	>> ${TEMP_ENV_FILE}) \
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
	| sed -E 's/^([A-Za-z][A-Za-z0-9_-]*)=(.*)/\1/' \
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

CONFIRM = (\
	printf "$(1) [y/N]" 1>&2; printf " " 1>&2; \
	read answer && ( \
	test "$${answer:-N}" = "y" || \
	test "$${answer:-N}" = "Y") \
)

### State management

up:
	@$(call DOCKER_COMPOSE, up --detach ${MAKE_APP_SERVICES})

start:
	@$(call DOCKER_COMPOSE, start ${MAKE_APP_SERVICES})

stop: down
down:
	@$(call DOCKER_COMPOSE, stop ${MAKE_APP_SERVICES})

restart:
	@$(call DOCKER_COMPOSE, restart)

rm:
	@$(call DOCKER_COMPOSE, rm --force -v)

build:
	@$(call DOCKER_COMPOSE, build ${MAKE_APP_SERVICES})

create:
	@$(call DOCKER_COMPOSE, up --no-start ${MAKE_APP_SERVICES})

logs:
	@$(call DOCKER_COMPOSE, logs --follow)

$(addprefix build-, ${MAKE_SERVICES}): build-%:
	@$(call DOCKER_COMPOSE, build $*)

$(addprefix create-, ${MAKE_SERVICES}): create-%:
	@$(call DOCKER_COMPOSE, up --no-start $*)

$(addprefix start-, ${MAKE_SERVICES}): start-%:
	@$(call DOCKER_COMPOSE, up -d $*)

$(addprefix stop-, ${MAKE_SERVICES}): stop-%:
	@$(call DOCKER_COMPOSE, stop $*)

$(addprefix kill-, ${MAKE_SERVICES}): kill-%:
	@$(call DOCKER_COMPOSE, kill $*)

$(addprefix restart-, ${MAKE_SERVICES}): restart-%:
	@$(call DOCKER_COMPOSE, restart $*)

$(addprefix rm-, ${MAKE_SERVICES}): rm-%:
	@$(call DOCKER_COMPOSE, rm --force -v $*)

$(addprefix fuck-, ${MAKE_SERVICES}): fuck-%: \
	stop-% rm-% build-% create-% start-%

$(addsuffix -sh, ${MAKE_SERVICES}): %-sh:
	@$(call DOCKER_COMPOSE, exec $* sh)

$(addsuffix -logs, ${MAKE_SERVICES}): %-logs:
	@$(call DOCKER_COMPOSE, logs --follow $*)

setup: db-migrate
	@make db-import < ./db/tokens.sql

fuck: stop rm build create start

off: up logs

### Tests

test-api:
	@$(call DOCKER_COMPOSE_RUN,--rm ${DOCKER_API_SERVICE} test)

test-relayer:
	@$(call DOCKER_COMPOSE_RUN,--rm ${DOCKER_RELAYER_SERVICE} test)

test: test-api test-relayer test-contracts

### Database

db-client:
	@$(call DOCKER_COMPOSE_EXEC, \
		${DOCKER_DB_SERVICE} mysql \
			--user=${MYSQL_USER} \
			--password=${MYSQL_PASSWORD} \
			--default-character-set=utf8mb4 \
			${MYSQL_DATABASE} \
	)

db-import:
	@$(call DOCKER_COMPOSE_EXEC, \
			-T ${DOCKER_DB_SERVICE} mysql \
			--host=${MYSQL_HOST} \
			--user=${MYSQL_USER} \
			--password=${MYSQL_PASSWORD} \
			--default-character-set=utf8mb4 \
			${MYSQL_DATABASE} \
	)

db-upgrade: db-migrate
db-migrate: db-ormconfig
	@$(call DOCKER_COMPOSE_RUN, --rm ${DOCKER_API_SERVICE} migration:run)

db-rollback: db-ormconfig
	@$(call DOCKER_COMPOSE_RUN, --rm ${DOCKER_API_SERVICE} migration:revert)

db-generate-migration: db-ormconfig
	@$(call DOCKER_COMPOSE_RUN, --rm ${DOCKER_API_SERVICE} migration:generate)

db-ormconfig:
	@$(call DOCKER_COMPOSE_RUN, --rm ${DOCKER_API_SERVICE} ormconfig)

db-add-tokens:
	@$(call DOCKER_COMPOSE_RUN, --rm ${DOCKER_API_SERVICE} add-tokens)

### Localstack

AWS_CLI = \
	@$(call DOCKER, run \
		--network ${DOCKER_NETWORK_NAME} \
		--rm -it \
		-e "AWS_DEFAULT_REGION=${AWS_SQS_REGION}" \
		-e "AWS_ACCESS_KEY_ID=${AWS_SQS_ACCESS_KEY}" \
		-e "AWS_SECRET_ACCESS_KEY=${AWS_SQS_SECRET}" \
		$(2) \
		amazon/aws-cli \
		--endpoint-url=http://${DOCKER_LOCALSTACK_SERVICE}:${LOCALSTACK_PORT} \
		$(1) \
	)

AWS_CLI_MESSAGE = \
	@$(call AWS_CLI,\
		$(1),\
		-v $(PWD)/relayer/message.json:/message.json\
	)

create-queue:
	@$(call AWS_CLI, sqs create-queue --queue-name ${AWS_SQS_QUEUE_NAME} --attributes '{"FifoQueue": "True"}')

list-queues:
	@$(call AWS_CLI, sqs list-queues)

send-message:
	@$(call AWS_CLI_MESSAGE, sqs send-message \
 		--queue-url ${AWS_SQS_QUEUE_URL} \
 		--message-body '' \
 		--message-deduplication-id '' \
 		--message-group-id '' \
 		--message-attributes file:///message.json \
 	)

### Contracts

CONTRACTS = $(call DOCKER_COMPOSE_RUN,--rm ${DOCKER_CONTRACTS_SERVICE} $(1))

build-contracts:
	@$(call CONTRACTS, build)

test-contracts:
	@$(call CONTRACTS, test)

## Live chain

CONTRACTS_LIVE_RUN = $(call CONTRACTS,$(1) --network $(2) --chain $(2))

# : deploy

$(addprefix deploy-all-, ${ENABLED_NETWORKS}): deploy-all-%:
	@$(call CONFIRM,Deploy all?)
	@$(call CONTRACTS_LIVE_RUN,deploy-all,$*)

$(addprefix deploy-facet-, ${ENABLED_NETWORKS}): deploy-facet-%:
	@$(call CONFIRM,Deploy facet?)
	@$(call CONTRACTS_LIVE_RUN,deploy-facet --facet $(facet),$*)

$(addprefix deploy-bridge-, ${ENABLED_NETWORKS}): deploy-bridge-%:
	@$(call CONFIRM,Deploy bridge?)
	@$(call CONTRACTS_LIVE_RUN,deploy-bridge --bridge $(bridge),$*)

$(addprefix deploy-dex-, ${ENABLED_NETWORKS}): deploy-dex-%:
	@$(call CONFIRM,Deploy dex?)
	@$(call CONTRACTS_LIVE_RUN,deploy-dex --dex $(dex),$*)

# : mantain

$(addprefix verify-, ${ENABLED_NETWORKS}): verify-%:
	@$(call CONFIRM,Verify diamond?)
	@$(call CONTRACTS_LIVE_RUN,verify-diamond,$*)

$(addprefix retrieve-, ${ENABLED_NETWORKS}): retrieve-%:
	@$(call CONFIRM,Retrieve $(amount) of $(token)?)
	@$(call CONTRACTS_LIVE_RUN,retrieve --token $(token) --amount $(amount),$*)

$(addprefix update-relayer-, ${ENABLED_NETWORKS}): update-relayer-%:
	@$(call CONFIRM,Update relayer?)
	@$(call CONTRACTS_LIVE_RUN,update-relayer,$*)

# : loupe

$(addprefix loupe-diamond-, ${ENABLED_NETWORKS}): loupe-diamond-%:
	@$(call CONTRACTS_LIVE_RUN,loupe --store diamond,$*)

$(addprefix loupe-bridge-, ${ENABLED_NETWORKS}): loupe-bridge-%:
	@$(call CONTRACTS_LIVE_RUN,loupe --store bridge,$*)

$(addprefix loupe-swap-, ${ENABLED_NETWORKS}): loupe-swap-%:
	@$(call CONTRACTS_LIVE_RUN,loupe --store swap,$*)

# : bulk deploy

$(addprefix dd-, ${ENABLED_NETWORKS}): dd-%: # will create new address
	@$(call CONFIRM,You REALLY want to create a new diamond?)
	@$(call CONTRACTS_LIVE_RUN,deploy-all,$*)
	@$(call CONTRACTS_LIVE_RUN,deploy-bridge --bridge Anyswap,$*)
	@$(call CONTRACTS_LIVE_RUN,deploy-dex --dex ZeroEx,$*)

$(addprefix ud-, ${ENABLED_NETWORKS}): ud-%: # will use current address
	@$(call CONFIRM,You REALLY want to update the whole diamond?)
	@$(call CONTRACTS_LIVE_RUN,deploy-facet --facet DiamondCutterFacet,$*)
	@$(call CONTRACTS_LIVE_RUN,deploy-facet --facet RouterFacet,$*)
	@$(call CONTRACTS_LIVE_RUN,deploy-facet --facet RelayerUpdaterFacet,$*)
	@$(call CONTRACTS_LIVE_RUN,deploy-facet --facet ProviderUpdaterFacet,$*)
	@$(call CONTRACTS_LIVE_RUN,deploy-facet --facet FeeManagerFacet,$*)
	@$(call CONTRACTS_LIVE_RUN,deploy-facet --facet DiamondLoupeFacet,$*)
	@$(call CONTRACTS_LIVE_RUN,deploy-bridge --bridge Anyswap,$*)
	@$(call CONTRACTS_LIVE_RUN,deploy-dex --dex ZeroEx,$*)

## Forked chain

$(addprefix fork-, ${ENABLED_NETWORKS}): fork-%:
	@$(call DOCKER_COMPOSE_RUN, \
		--rm \
		-e "FORKING=true" \
		-e "FORKED_RPC_NODE=${$*_RPC_NODE}" \
		-e "FORKED_CHAIN_ID=${$*_CHAIN_ID}" \
		-p ${$*_EXTERNAL_PORT}:8545 \
		--name "running-$*" \
		${DOCKER_CONTRACTS_SERVICE} \
		up \
	)

CONTRACTS_DOCKER_EXEC = $(call DOCKER,exec -it "running-$(1)" $(2))
CONTRACTS_RUN = $(call CONTRACTS_DOCKER_EXEC,$(1),yarn $(2) --chain localhost --network localhost)

CONTRACTS_DEPLOY_ALL = $(call CONTRACTS_RUN,$(1),deploy-all)
CONTRACTS_DEPLOY_FACET = $(call CONTRACTS_RUN,$(1),deploy-facet --facet $(2))
CONTRACTS_DEPLOY_BRIDGE = $(call CONTRACTS_RUN,$(1),deploy-bridge --bridge $(2))
CONTRACTS_DEPLOY_DEX = $(call CONTRACTS_RUN,$(1),deploy-dex --dex $(2))
CONTRACTS_GET_TOKENS = $(call CONTRACTS_RUN,$(1),get-tokens --token $(2))
CONTRACTS_LOUPE = $(call CONTRACTS_RUN,$(1),loupe --store $(2))

# : deploy

$(addprefix deploy-all-fork-, ${ENABLED_NETWORKS}): deploy-all-fork-%:
	@$(call CONTRACTS_DEPLOY_ALL,$*)

$(addprefix deploy-facet-fork-, ${ENABLED_NETWORKS}): deploy-facet-fork-%:
	@$(call CONTRACTS_DEPLOY_FACET,$*,$(facet))

$(addprefix deploy-bridge-fork-, ${ENABLED_NETWORKS}): deploy-bridge-fork-%:
	@$(call CONTRACTS_DEPLOY_BRIDGE,$*,$(bridge))

$(addprefix deploy-dex-fork-, ${ENABLED_NETWORKS}): deploy-dex-fork-%:
	@$(call CONTRACTS_DEPLOY_DEX,$*,$(dex))

# : fake

$(addprefix get-tokens-, ${ENABLED_NETWORKS}): get-tokens-%:
	@$(call CONTRACTS_GET_TOKENS,$*,$(token))

# : loupe

$(addprefix loupe-fork-diamond-, ${ENABLED_NETWORKS}): loupe-fork-diamond-%:
	@$(call CONTRACTS_LOUPE,$*,diamond)

$(addprefix loupe-fork-bridge-, ${ENABLED_NETWORKS}): loupe-fork-bridge-%:
	@$(call CONTRACTS_LOUPE,$*,bridge)

$(addprefix loupe-fork-swap-, ${ENABLED_NETWORKS}): loupe-fork-swap-%:
	@$(call CONTRACTS_LOUPE,$*,swap)

# : bulk deploy

$(addprefix ddf-, ${ENABLED_NETWORKS}): ddf-%:
	@$(call CONTRACTS_DEPLOY_ALL,$*)
	@$(call CONTRACTS_DEPLOY_BRIDGE,$*,Anyswap)
	@$(call CONTRACTS_DEPLOY_DEX,$*,ZeroEx)

$(addprefix udf-, ${ENABLED_NETWORKS}): udf-%:
	@$(call CONTRACTS_DEPLOY_FACET,$*,RouterFacet)
	@$(call CONTRACTS_DEPLOY_FACET,$*,RelayerUpdaterFacet)
	@$(call CONTRACTS_DEPLOY_FACET,$*,ProviderUpdaterFacet)
	@$(call CONTRACTS_DEPLOY_FACET,$*,DiamondLoupeFacet)
	@$(call CONTRACTS_DEPLOY_FACET,$*,DiamondCutterFacet)
	@$(call CONTRACTS_DEPLOY_BRIDGE,$*,Anyswap)
	@$(call CONTRACTS_DEPLOY_DEX,$*,ZeroEx)

### Relayer

RELAYER = $(call DOCKER_COMPOSE_RUN,--rm ${DOCKER_RELAYER_SERVICE} $(1))

relayer-events: create-queue
	@$(call RELAYER,run:dev:events)

relayer-multichain:
	@$(call RELAYER,run:dev:multichain)

relayer-consumer:
	@$(call RELAYER,run:dev:consumer)

### Terraform

TERRAFORM = $(call DOCKER_COMPOSE_RUN,--rm ${DOCKER_TERRAFORM_SERVICE} $(1))
TERRAFORM_SWITCH = $(call TERRAFORM,workspace select ${ENV})

tf-init:
	@$(call TERRAFORM,init \
		 -backend-config="access_key=${CREATOR_AWS_ACCESS_KEY}" \
		 -backend-config="secret_key=${CREATOR_AWS_SECRET_KEY}" \
	)

tf-plan:
	@$(call TERRAFORM_SWITCH)
	@$(call TERRAFORM,plan)

tf-apply:
	@$(call TERRAFORM_SWITCH)
	@$(call TERRAFORM,apply)

tf-destroy:
	@$(call TERRAFORM_SWITCH)
	@$(call TERRAFORM,destroy)

### Ansible

PLAYBOOKS_PATH = infrastructure/ansible/playbooks

RUN_PLAYBOOK = ansible-playbook -i infrastructure/ansible/inventory.ini -e "nodes=$(1)" $(2)
RUN_PLAYBOOK_GLOBAL = $(call RUN_PLAYBOOK,$(1),${PLAYBOOKS_PATH}/$(2))
RUN_PLAYBOOK_ON_SERVICE = $(call RUN_PLAYBOOK,$(2)_$(1),-e "service=$(2)" ${PLAYBOOKS_PATH}/$(3))

$(addprefix setup-instances-, test prod): setup-instances-%:
	@$(call RUN_PLAYBOOK_GLOBAL,$*,docker.yml)
	@$(call RUN_PLAYBOOK_GLOBAL,$*,profile.yml)
	@$(call RUN_PLAYBOOK_ON_SERVICE,$*,api,setup_node_files.yml)
	@$(call RUN_PLAYBOOK_ON_SERVICE,$*,relayer,setup_node_files.yml)
	@$(call RUN_PLAYBOOK_ON_SERVICE,$*,grafana,setup_node_files.yml)

### Grafana

grafana-setup:
	@docker plugin install grafana/loki-docker-driver:latest --alias loki --grant-all-permissions

grafana-up:
	@$(call DOCKER_COMPOSE, up --detach ${MAKE_GRAFANA_SERVICES})

grafana-down:
	@$(call DOCKER_COMPOSE, stop ${MAKE_GRAFANA_SERVICES})