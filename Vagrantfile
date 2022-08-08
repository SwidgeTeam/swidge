Vagrant.configure("2") do |config|
  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://vagrantcloud.com/search.
  config.vm.box = "debian/bullseye64"

  # Enable provisioning with a shell script.
  config.vm.provision "shell", inline: <<-SHELL
     apt-get update
     apt-get install -y make
  SHELL

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  config.vm.provider "virtualbox" do |vb|
      # Customize the amount of memory on the VM:
    vb.memory = "4096"
  end

  # Enable provisioning with a provider
  # https://github.com/leighmcculloch/vagrant-docker-compose
  # vagrant plugin install vagrant-docker-compose
  config.vm.provision :docker
  config.vm.provision :docker_compose

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine and only allow access
  # via 127.0.0.1 to disable public access
  config.vm.network "forwarded_port", guest: 3000, host: 3000, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 3001, host: 3001, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 8501, host: 8501

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  config.vm.network "public_network"
end
