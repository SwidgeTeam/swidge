from brownie import Router, ZeroEx, Anyswap
from brownie.network.main import show_active

from scripts.src.accounts import deployer, relayer, user
from scripts.src.addresses import load_addresses
from scripts.src.Contracts import Contracts

network = show_active()
if '-fork' in network or network == 'local':
    confirmations = 1
else:
    confirmations = 2

from_deployer = {'from': deployer, 'required_confs': confirmations}
from_user = {'from': user, 'required_confs': 1}

"""
Deploys the whole set of contracts
and returns the instances
"""
def deploy_contracts(network):
    address = load_addresses(network)

    router = Router.deploy(from_deployer)
    zeroEx = ZeroEx.deploy(from_deployer)
    anyswap = Anyswap.deploy(address['bridges']['anyswap'], from_deployer)

    zeroEx.updateRouter(router.address, from_deployer)
    anyswap.updateRouter(router.address, from_deployer)

    router.updateSwapProvider(
        address['swapImpl']['zeroex']['code'],
        zeroEx.address,
        from_deployer)

    router.updateBridgeProvider(
        address['bridgeImpl']['anyswap']['code'],
        anyswap.address,
        from_deployer)

    router.updateRelayer(relayer.address, from_deployer)

    return Contracts(
        router=router,
        zeroex=zeroEx,
        multichain=anyswap)
