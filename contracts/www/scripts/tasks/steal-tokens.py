from brownie.network.main import show_active

from scripts.src.tokens import load_tokens, transfer_tokens_to

def main(token, receiver):
    network = show_active()
    tokens = load_tokens(network)

    transfer_tokens_to(
        token_address=tokens[token]['address'],
        from_address=tokens[token]['holder'],
        to_address=receiver,
        amount=100000000000000000000)
