from brownie import Router
from brownie.network.main import show_active

from scripts.src.accounts import relayer
from scripts.src.deploy import from_deployer
from scripts.src.addresses import load_addresses

"""
Sets the relayer address into the Router
"""
def main():
    network = show_active()
    address = load_addresses(network)

    router = Router.at(address['router'])

    router.updateRelayer(
        relayer.address,
        from_deployer)
