# Smart contracts for Swidge

This project contains the on-chain code that executes and forwards transactions 
across a set of different providers.

### Requirements

- brownie
- node

### Set up
Set required networks in the local brownie networks file.
```shell
make import
```

### Test
```shell
yarn test
```

### Deploy

- Deploy router

```shell
make deploy.router.<chain>
```

- Deploy providers

```shell
make deploy.anyswap.<chain>
make deploy.zeroex.<chain>
```

- Verify router

```shell
make verify.router.<chain>
```

#### Accepted chains

Look in `.make.cfg` file in the project's root.


