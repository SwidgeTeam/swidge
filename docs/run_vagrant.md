## Run Vagrant box

In some cases it might be convenient to not install all the dependencies on your local machine, or in others some
specific configurations are not working as expected because you are using a non-supported OS.

In those cases you can wrap the whole system in a Vagrant box, that way you only have to install one dependency,
Vagrant.

Let's see how this goes.

- [Install Vagrant on your machine](https://www.vagrantup.com/downloads)
- [Install docker compose Vagrant plugin](https://github.com/leighmcculloch/vagrant-docker-compose). TL;DR: `vagrant plugin install vagrant-docker-compose` 
- Use your local terminal to move to the projects folder
- `vagrant up`
- Wait for the process, it will take a bit of time because it has to download a VM and install some packages
- If it asks which interface it has to connect to, select the one that you use to connect to inet
- Once it's finished, you have already a headless VM running on your machine, but docker is not running yet
- To enter inside the box, run: `vagrant ssh`
- You're in the box now
- Go to where the project lives: `cd /vagrant`. This folder is mounted directly from you host system
- [Go to the README](../README.md) and follow the _Starting the application_ and _Initial setup_ steps