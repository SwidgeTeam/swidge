from brownie import Router
from brownie.network.main import show_active

from scripts.src.addresses import save_addresses, load_addresses
from scripts.src.deploy import deploy_contracts

"""
Verifies the Router deployed contract
"""
def main():
    network = show_active()
    address = load_addresses(network)

    router = Router.at(address['router'])

    Router.publish_source(router)

