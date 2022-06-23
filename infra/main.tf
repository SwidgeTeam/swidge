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
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}

/** Local variables **/

locals {
  availability_zones = [
    "${var.region}a",
  ]
  api_public_subnets_cidr = [
    cidrsubnet(var.vpc_cidr, 4, 1),
  ]
  relayer_public_subnets_cidr = [
    cidrsubnet(var.vpc_cidr, 4, 2),
  ]
  db_private_subnets_cidr = [
    cidrsubnet(var.vpc_cidr, 4, 3),
  ]
}

/** VPC **/

module "my_vpc" {
  source = "./modules/vpc"

  environment = var.environment
  vpc_cidr    = var.vpc_cidr
}

/** Internet gateway **/

resource "aws_internet_gateway" "igw" {
  vpc_id = module.my_vpc.vpc_id

  tags = {
    Name        = "${var.environment}-igw"
    Environment = var.environment
  }
}

/** API **/

module "api" {
  source = "./blocks/api"

  region              = var.region
  environment         = var.environment
  vpc_id              = module.my_vpc.vpc_id
  public_subnets_cidr = local.api_public_subnets_cidr
  availability_zones  = local.availability_zones
  internet_gateway_id = aws_internet_gateway.igw.id
}

/** Relayer **/

module "relayer" {
  source = "./blocks/relayer"

  region              = var.region
  environment         = var.environment
  vpc_id              = module.my_vpc.vpc_id
  public_subnets_cidr = local.api_public_subnets_cidr
  availability_zones  = local.availability_zones
  internet_gateway_id = aws_internet_gateway.igw.id
}
