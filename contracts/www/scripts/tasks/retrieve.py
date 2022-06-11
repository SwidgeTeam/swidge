from brownie import Router
from brownie.network.main import show_active
from brownie.network import gas_price

from scripts.src.deploy import from_deployer
from scripts.src.addresses import load_addresses

"""
Retrieve tokens stuck on the router
"""
def main(token, amount):
    network = show_active()
    address = load_addresses(network)

    router = Router.at(address['router'])

    print(token)
    print(amount)

    router.retrieve(
        token,
        amount,
        from_deployer)
