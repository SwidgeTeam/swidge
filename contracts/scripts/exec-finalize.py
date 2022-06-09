from brownie import Router
from brownie.network.main import show_active

from scripts.src.addresses import load_addresses
from scripts.src.deploy import from_deployer, from_user
from scripts.src.accounts import user
from scripts.src.tokens import load_tokens, transfer_tokens_to

"""
Executes the function finalizeTokenCross from Router
"""
def main():
    network = show_active()
    address = load_addresses(network)

    router = Router.at(address['router'])

    router.updateRelayer(user.address, from_deployer)

    tokens = load_tokens(network)

    amount = 14 * 1000000

    callData = '0x000000000000000000000000def1c0ded9bec7f1a1670819833240f027b25eff415565b00000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa8417400000000000000000000000053e0bca35ec356bd5dddfebbd1fc0fd03fabad390000000000000000000000000000000000000000000000000000000000d4d01b00000000000000000000000000000000000000000000000019ecf283aa713c7300000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000003400000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa8417400000000000000000000000053e0bca35ec356bd5dddfebbd1fc0fd03fabad3900000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000260000000000000000000000000000000000000000000000000000000000000026000000000000000000000000000000000000000000000000000000000000002400000000000000000000000000000000000000000000000000000000000d4d01b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000001142616c616e63657256320000000000000000000000000000000000000000000000000000000000000000000000d4d01b00000000000000000000000000000000000000000000000019ecf283aa713c7300000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000040000000000000000000000000ba12222222228d8ba445958a75a0704d566bf2c836128d5436d2d70cab39c9af9cce146c38554ff0000100000000000000000008000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000020000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa84174000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000000000000000000000000000000000000000000000869584cd0000000000000000000000001000000000000000000000000000000000000011000000000000000000000000000000000000000000000012e7c2369862823896'

    tx = router.finalizeSwidge(
        amount,
        user.address,
        [
            0,
            tokens['usdc']['address'],
            tokens['link']['address'],
            callData,
            True
        ],
        'random-uuid',
        from_user)

    print(tx.info())
    print('---')
