
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

module "api_instance" {
  source = "./modules/instance"

  name        = "api"
  ami_id      = module.ami.ami_id
  environment = var.environment
  subnets     = module.network.public_subnets
}