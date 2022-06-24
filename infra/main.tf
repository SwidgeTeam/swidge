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

provider "aws" {
  alias      = "east"
  region     = "us-east-1"
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}

/** Local variables **/

locals {
  availability_zones = [
    "${var.region}a",
    "${var.region}b",
  ]
  api_public_subnets_cidr = [
    cidrsubnet(var.vpc_cidr, 4, 1),
    cidrsubnet(var.vpc_cidr, 4, 2),
  ]
  relayer_public_subnets_cidr = [
    cidrsubnet(var.vpc_cidr, 4, 3),
  ]
  db_private_subnets_cidr = [
    cidrsubnet(var.vpc_cidr, 4, 4),
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

/** Certificate **/

module "global_cert" {
  source    = "./modules/certificate"
  providers = {
    aws : aws.east
  }
  domain      = var.domain
  environment = var.environment
}

module "regional_cert" {
  source    = "./modules/certificate"
  providers = {
    aws : aws
  }
  domain      = var.domain
  environment = var.environment
}

/** Services **/

module "api" {
  source = "./blocks/api"

  region              = var.region
  environment         = var.environment
  vpc_id              = module.my_vpc.vpc_id
  public_subnets_cidr = local.api_public_subnets_cidr
  availability_zones  = local.availability_zones
  internet_gateway_id = aws_internet_gateway.igw.id
  certificate_arn     = module.regional_cert.arn
}

module "relayer" {
  source = "./blocks/relayer"

  region              = var.region
  environment         = var.environment
  vpc_id              = module.my_vpc.vpc_id
  public_subnets_cidr = local.relayer_public_subnets_cidr
  availability_zones  = local.availability_zones
  internet_gateway_id = aws_internet_gateway.igw.id
}

module "front" {
  source = "./blocks/front"

  environment          = var.environment
  service_url          = "app.${var.domain}"
  deployer_account_arn = aws_iam_user.deployer.arn
  certificate_arn      = module.global_cert.arn
}

resource "aws_iam_user" "deployer" {
  name = "github-deployer"
}