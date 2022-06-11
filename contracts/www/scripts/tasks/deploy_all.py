from brownie.network.main import show_active

from scripts.src.addresses import save_addresses, load_addresses
from scripts.src.deploy import deploy_contracts

"""
Deploys the whole set of contracts
and saves the addresses on the file
"""
def main():
    network = show_active()
    contracts = deploy_contracts(network)

    address = load_addresses(network)

    address['router'] = contracts.router().address
    address['bridgeImpl']['anyswap']['address'] = contracts.multichain().address
    address['swapImpl']['zeroex']['address'] = contracts.zeroEx().address

    save_addresses(network, address)

