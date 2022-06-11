from brownie import Contract
import yaml

"""
Loads the list of tokens data of a specific domain
"""
def load_tokens(network):
    network = network.replace('-fork', '')
    with open('tokens.yaml', 'r') as file:
        addresses = yaml.safe_load(file)
        return addresses[network]

"""
Transfers an `amount` of tokens from `from_address` to `to_address`
"""
def transfer_tokens_to(token_address, from_address, to_address, amount):
    try:
        token = Contract(token_address)
    except:
        token = Contract.from_explorer(token_address)
    token.transfer(to_address, amount, {'from': from_address})

"""
Approves an `amount` of tokens from `from_address` to `to_address`
"""
def approve_tokens_to(token_address, from_address, to_address, amount):
    try:
        token = Contract(token_address)
    except:
        token = Contract.from_explorer(token_address)
    token.approve(to_address, amount, {'from': from_address})
