from brownie.network.main import show_active

from scripts.src.tokens import load_tokens, transfer_tokens_to
from scripts.src.accounts import deployer, relayer, user


def main(token):
    network = show_active()
    tokens = load_tokens(network)
    token_data = tokens[token]

    transfer(token=token_data, receiver=deployer)
    transfer(token=token_data, receiver=relayer)
    transfer(token=token_data, receiver=user)


def transfer(token, receiver):
    decimals = token['decimals']
    amount = 100 * 10 ** decimals
    transfer_tokens_to(
        token_address=token['address'],
        from_address=token['holder'],
        to_address=receiver,
        amount=amount)
