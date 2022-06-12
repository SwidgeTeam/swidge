from brownie import accounts
from scripts.src.accounts import deployer, relayer, user


def main():
    transfer(deployer)
    transfer(relayer)
    transfer(user)


def transfer(receiver):
    # Just in case we execute the script many times without resetting the network.
    # This way we have available double the amount.
    try:
        sendFromTo(accounts[0], receiver)
    except:
        sendFromTo(accounts[1], receiver)


def sendFromTo(sender, receiver):
    sender.transfer(receiver, '10 ether')
