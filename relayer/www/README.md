## Description

Relayer project repository.

Contains the code for the process that are running constantly checking for 
events to update the state on our system and finish the the transactions of the 
users.

## Installation

```bash
$ yarn install
```

## Running the processes

```bash
# smart contracts events listener
$ ts-node src/events-listener.ts

# Multichain completed transactions listener
$ ts-node src/index-multichain.ts
```

## Test

```bash
# unit tests
$ yarn test
```

## Stay in touch

- Website - [https://swidge.app](https://swidge.app/)
- Twitter - [@therealswidge](https://twitter.com/therealswidge)
