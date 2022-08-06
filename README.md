## Quick setup

### Prerequisites

This application should run on any UN*X operating system, including most Linux distros and Mac OS X versions.

Make sure you have the following installed on your system:

- [Git](https://git-scm.com/downloads)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Make](https://www.gnu.org/software/make/)

### Getting the code

Make sure you are a member on the [GitHub team](https://github.com/SwidgeTeam) and
you have already [configured `git`](https://docs.github.com/en/get-started/quickstart/set-up-git)
on your machine. Also make sure
you've [created an SSH key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
and [added it to your GitHub account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
.

Clone the repository with `git`:

``` sh
$ git clone git@github.com:SwidgeTeam/swidge.git
```

A new `swidge` directory should have been created wherever you typed the previous command. Change to this directory to
be able to run the commands which are described in successive sections:

``` sh
$ cd swidge
```

### Starting the application

In the `swidge` directory, type:

``` sh
$ make up
```

The app will be available in a moment on http://localhost:3000. Please note the first time you run this it will take a
bit since it has to download and build a few Docker images.

### Initial setup

The first time after you start the app, you need to perform an extra step to set up required data and configurations.

For that, once you have the app running, type the following:

``` sh
$ make setup
```

This will dump the existing migrations into the database, and create a queue for the localstack SQS.

### Stopping and restarting the application

You can stop the application with:

``` sh
$ make stop
```

Or use the `restart` shortcut if you intend to start it next:

``` sh
$ make restart
```

### Running a MySQL console

While the application is running, you can open a console to local MySQL server:

``` sh
$ make db-client
```

### Importing a SQL dump

Make sure the application is running and type:

``` sh
$ make db-import < ./path/to/your/dump.sql
```

## Hardhat

### Forking a chain

You can fork any accepted chain with:

``` sh
$ make fork-<chain>
```

That will run Hardhat inside a container and fork the selected chain.
Once you have done that, you can run any of the following helpers.

You can find the accepted chains on [this env file](https://github.com/SwidgeTeam/swidge/blob/master/env/default/networks.env).

### Deploy on forked chain

If you are working with the contracts and need to try things on local, you can deploy
all the contracts' suite on your already forked chain by typing:

``` sh
$ make deploy-all-fork-<chain>
```

The _chain_ here must be the same that its already forked, because the contracts to be
deployed have external contract addresses dependencies.

### Obtain tokens

If you need some tokens instead, you can just get them from an already holding wallet by typing:

``` sh
$ make get-tokens-<chain> token=<token_name>
```

You can find the accepted tokens
on [this YAML file](https://github.com/SwidgeTeam/swidge/blob/master/contracts/www/tasks/helpers/tokens.yaml).
But if the one you're looking for it's not there, you can always add it.

## Troubleshooting

### Resetting local database

Your local database will store its data on the `data/db` directory. Empty or remove this directory while the application
is stopped to reset the database. You may need `sudo` to delete these files.

``` sh
$ make stop
$ rm -fr data/db # Or: sudo rm -fr data/db
$ make start
$ make db-migrate
```

### Prompting logs

At any time, you can access to the full live feed of logs of the app by typing:

```sh
$ make logs
```

Or you can get the logs of one specific service with:

```sh
$ make <service-name>-logs
```

The service names are the names defined for the services on the docker-compose.yml.

### Recreating Docker images/containers

If some changes have been made to the infrastructure, or if you are experiencing weird issues
that you might identify as being related to misbehaving infrastructure, you can recreate it all
and restart it showing the logs to be able to debug, with:

```sh
$ make fuck off
```

### Customizing the environment

If you need to change any of the environment variables for you local setup, you can
do so by creating a `.env` file on the root of the project, and adding there any of 
the variables you wish to override.

For example you could have something like:

```sh
DOCKER_COMPOSE_COMMAND=docker compose
MYSQL_PORT=33060
```

That would tell Makefile to invoke Docker Compose with that custom command, and would 
use the port 33060 of your machine to expose the MySQL server.

You can do the same with any variable of the conditionally set variables on the Makefile, as 
also any of the variables on the `/env` folder.

### Running Vagrant

If for some reason you cannot run Docker on your machine, or you have trouble with some OS-specific dependencies 
configurations, you can just run everything inside a Vagrant box. For that, [follow these steps](docs/run_forked_chains.md).

## Running the whole system in local

In order to execute the whole lifecycle of a transaction on your loal machine, 
[follow these steps](docs/run_forked_chains.md).

## Git workflow

### Resolving an issue

Changes to the code should be related to a exiting card on Trello. If you
are about to make changes which are not documented on an issue, create one
first. Assign the issue to yourself.

1. Make sure your working directory is clean:

   ``` sh
   $ git status
   ```

2. Switch to the point you want to start your branch from. It will be `master` most of the times:

   ``` sh
   $ git checkout master
   ```

3. Ensure your branch is up-to-date with remote repository:

   ``` sh
   $ git pull
   ```

4. Create your new branch. Its name should follow the
   pattern: `{trello-card-id}-{short-snake-cased-description-of-the-solution}`. For example, if you are going to resolve
   an issue with ID `TvKVs0U3`, whose title is `Small amounts on the origin input should be well formatted`:

   ``` sh
   $ git checkout --branch TvKVs0U3-small-amounts-on-origin-input 
   # Or: git checkout -b TvKVs0U3-small-amounts-on-origin-input
   ```

5. Do some coding..

6. Push your new branch to the remote repository with `git push`. The first time you do this on a branch, you'll need to
   add the following arguments in order to link your local branch with the remote one for subsequent pushes:

   ``` sh
   $ git push --set-upstream origin TvKVs0U3-small-amounts-on-origin-input 
   # Or: git push -u origin TvKVs0U3-small-amounts-on-origin-input
   ``` 
