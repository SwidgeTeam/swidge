
/** Provider **/

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.19.0"
    }
  }
}

provider "aws" {
  region     = var.region
}

/** Local variables **/

locals {
  availability_zones = [
    "${var.region}a",
  ]
}

/** Modules **/

module "network" {
  source = "./modules/network"

  region              = var.region
  environment         = var.environment
  vpc_cidr            = var.vpc_cidr
  public_subnets_cidr = var.public_subnets_cidr
  availability_zones  = local.availability_zones
}

module "ami" {
  source = "./modules/ami"
}

/** Instances **/

resource "aws_network_interface" "api_net_interface" {
  subnet_id         = element(module.network.public_subnets.*.id, count.index)
  count             = length(var.public_subnets_cidr)
  private_ips_count = 1

  tags = {
    Name = "api_network_interface"
  }
}

resource "aws_instance" "api-instance" {
  ami           = module.ami.ami_id
  instance_type = "t2.micro"
  count         = length(var.public_subnets_cidr)

  network_interface {
    network_interface_id = element(aws_network_interface.api_net_interface.*.id, count.index)
    device_index         = 0
  }

  tags = {
    Name        = "${var.environment}-api-instance"
    Environment = var.environment
  }
}
