from brownie import Router
from brownie.network.main import show_active
from brownie.network import gas_price

from scripts.src.deploy import from_deployer
from scripts.src.addresses import load_addresses

"""
Sets the whole set of providers into the deployed Router
"""
def main():
    network = show_active()
    address = load_addresses(network)

    router = Router.at(address['router'])

    #gas_price("12000 gwei")

    router.updateSwapProvider(
        address['swapImpl']['zeroex']['code'],
        address['swapImpl']['zeroex']['address'],
        from_deployer)

    router.updateBridgeProvider(
        address['bridgeImpl']['anyswap']['code'],
        address['bridgeImpl']['anyswap']['address'],
        from_deployer)
