locals {
  name = "api"
}

module "api-subnets" {
  source = "../../modules/public_subnets"

  name                = local.name
  region              = var.region
  environment         = var.environment
  vpc_id              = var.vpc_id
  public_subnets_cidr = var.public_subnets_cidr
  availability_zones  = var.availability_zones
  internet_gateway_id = var.internet_gateway_id
}

module "api-instance" {
  source = "../../modules/instance"

  name        = local.name
  environment = var.environment
  subnets     = module.api-subnets.public_subnets
}
