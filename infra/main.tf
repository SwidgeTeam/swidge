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

module "my_vpc" {
  source = "./modules/vpc"

  environment = var.environment
  vpc_cidr    = var.vpc_cidr
}

module "network" {
  source = "./modules/network"

  region              = var.region
  environment         = var.environment
  vpc_id              = module.my_vpc.vpc_id
  public_subnets_cidr = var.api_public_subnets_cidr
  availability_zones  = local.availability_zones
}

module "api_instance" {
  source = "./modules/instance"

  name        = "api"
  environment = var.environment
  subnets     = module.network.public_subnets
}