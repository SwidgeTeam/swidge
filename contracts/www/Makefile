-include .make.cfg

TEMP_ENV_FILE := $(shell mktemp -t ".env.XXXXXX")

$(shell echo -n "DEPLOY_COMMANDS=" >> ${TEMP_ENV_FILE})
$(foreach net, ${NETWORKS}, $(eval _ := $(shell \
    $(foreach contract, ${CONTRACTS}, $(eval _ := $(shell \
        echo -n "${contract}.${net} " \
        >> ${TEMP_ENV_FILE} \
    ))) \
)))

-include ${TEMP_ENV_FILE}

REMOVE_TEMP_ENV_FILE := $(shell unlink ${TEMP_ENV_FILE})

BROWNIE = brownie
BROWNIE_RUN = ${BROWNIE} run --network $(1) $(2)

BROWNIE_DEPLOY = $(call BROWNIE_RUN, $(2), scripts/tasks/deploy.py main $(1))
BROWNIE_VERIFY = $(call BROWNIE_RUN, $(1), scripts/tasks/verify-router.py)
BROWNIE_RETRIEVE = $(call BROWNIE_RUN, $(1), scripts/tasks/retrieve.py main $(2) $(3))
BROWNIE_DEPLOY_ALL = $(call BROWNIE_RUN, $(1), scripts/tasks/deploy_all.py)

$(addprefix deploy., ${DEPLOY_COMMANDS}): deploy.%:
	@$(call BROWNIE_DEPLOY,\
		$(shell echo $* | cut -d'.' -f 1),\
		$(shell echo $* | cut -d'.' -f 2)\
	)

$(addprefix verify.router., ${NETWORKS}): verify.router.%:
	@$(call BROWNIE_VERIFY,$*)

$(addprefix retrieve., ${NETWORKS}): retrieve.%:
	@$(call BROWNIE_RETRIEVE,$*,$(TOKEN),$(AMOUNT))

$(addprefix deploy.all., ${NETWORKS}): deploy.all.%:
	@$(call BROWNIE_DEPLOY_ALL,$*)
