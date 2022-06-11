from brownie import accounts, config

"""
Names the accounts with names for the rest of the scripts to use
"""
mnemonic = config['wallet']['mnemonic']
acc = accounts.from_mnemonic(mnemonic, 10)

deployer = acc[0]
relayer = acc[1]
user = acc[2]
