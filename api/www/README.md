## Description

API project of Swidge. It provides service to the frontend app.  

## Installation

```bash
$ yarn install
```

## Inital setup

```bash
$ yarn ormconfig 
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## ORM CLI

```bash
# create the CLI required config file
$ yarn orconfig

# run existing migrations against local database
$ yarn migration:run

# generates a new migration with the diff of the db<->entities
$ yarn migration:generate <migration_name>
```
