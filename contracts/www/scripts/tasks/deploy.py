from brownie import Router, ZeroEx, Anyswap
from brownie.network.main import show_active
from brownie.network import gas_price

from scripts.src.addresses import save_addresses, load_addresses
from scripts.src.deploy import from_deployer

"""
Deploy something
"""
def main(contract):
    domain = show_active()
    address = load_addresses(domain)

    #gas_price("10000 gwei")

    if contract == 'zeroex':
        # Deploy provider contract
        zeroEx = ZeroEx.deploy(from_deployer)
        # Update router address on provider
        zeroEx.updateRouter(address['router'], from_deployer)
        # Store new address
        address['swapImpl']['zeroex']['address'] = zeroEx.address

    elif contract == 'anyswap':
        # Deploy provider contract
        multichain = Anyswap.deploy(address['bridges']['anyswap'], from_deployer)
        # Update router address on provider
        multichain.updateRouter(address['router'], from_deployer)
        # Store new address
        address['bridgeImpl']['anyswap']['address'] = multichain.address

    elif contract == 'router':
        # Deploy router contract
        router = Router.deploy(from_deployer)
        # Store new address
        address['router'] = router.address

    save_addresses(domain, address)