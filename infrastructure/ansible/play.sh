#!/bin/bash

PLAYBOOK=$1
shift
NODES=$1
shift

ansible-playbook -i inventory.ini -e "nodes=${NODES}" playbooks/${PLAYBOOK}.yml

# ./play.sh dependencies ${ENV}
# ./play.sh node_open_ports api_${ENV}
