/** Provider **/

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.19.0"
    }
  }

  backend "s3" {
    bucket = "swidge-terraform-backend"
    key    = "terraform.tfstate"
    region = "us-east-1"
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
  api_public_subnets_cidr = [
    cidrsubnet(var.vpc_cidr, 4, 1),
    cidrsubnet(var.vpc_cidr, 4, 2),
  ]
  relayer_public_subnets_cidr = [
    cidrsubnet(var.vpc_cidr, 4, 3),
  ]
  db_private_subnets_cidr = [
    cidrsubnet(var.vpc_cidr, 4, 4),
    cidrsubnet(var.vpc_cidr, 4, 5),
  ]
  grafana_public_subnets_cidr = [
    cidrsubnet(var.vpc_cidr, 4, 6),
    cidrsubnet(var.vpc_cidr, 4, 7),
  ]
  availability_zones = [
    "${var.region}a",
    "${var.region}b",
    "${var.region}c", // maybe remove on creation?
  ]
  front_service_url   = "app.${var.base_url}"
  api_service_url     = "api.${var.base_url}"
  grafana_service_url = "logs.${var.base_url}"
  instances_key_name  = "instances-key-pair"
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
  domain      = var.base_url
  environment = var.environment
  dns_zone_id = aws_route53_zone.dns_zone.id
}

module "regional_cert" {
  source    = "./modules/certificate"
  providers = {
    aws : aws
  }
  domain      = var.base_url
  environment = var.environment
  dns_zone_id = aws_route53_zone.dns_zone.id
}

/** Services **/

module "api" {
  source = "./blocks/api"

  ami_id              = var.ami_id
  region              = var.region
  environment         = var.environment
  vpc_id              = module.my_vpc.vpc_id
  public_subnets_cidr = local.api_public_subnets_cidr
  availability_zones  = local.availability_zones
  internet_gateway_id = aws_internet_gateway.igw.id
  certificate_arn     = module.regional_cert.arn
  instance_type       = var.api_instance_type
  key_name            = local.instances_key_name
  scrapper_ips        = module.grafana.public_ip
}

module "relayer" {
  source = "./blocks/relayer"

  ami_id              = var.ami_id
  region              = var.region
  environment         = var.environment
  vpc_id              = module.my_vpc.vpc_id
  public_subnets_cidr = local.relayer_public_subnets_cidr
  availability_zones  = local.availability_zones
  internet_gateway_id = aws_internet_gateway.igw.id
  instance_type       = var.relayer_instance_type
  transactions_queue  = var.transactions_queue
  events_queue        = var.events_queue
  relayer_account_arn = aws_iam_user.relayer.arn
  key_name            = local.instances_key_name
  scrapper_ips        = module.grafana.public_ip
}

module "grafana" {
  source = "./blocks/grafana"

  ami_id              = var.ami_id
  region              = var.region
  environment         = var.environment
  vpc_id              = module.my_vpc.vpc_id
  public_subnets_cidr = local.grafana_public_subnets_cidr
  availability_zones  = local.availability_zones
  internet_gateway_id = aws_internet_gateway.igw.id
  certificate_arn     = module.regional_cert.arn
  instance_type       = var.grafana_instance_type
  key_name            = local.instances_key_name
  allowed_ips         = concat(
    module.api.public_ip,
    module.relayer.public_ip
  )
}

module "front" {
  source = "./blocks/front"

  environment          = var.environment
  service_url          = local.front_service_url
  deployer_account_arn = aws_iam_user.deployer.arn
  certificate_arn      = module.global_cert.arn
}

module "database" {
  source = "./blocks/db"

  region                    = var.region
  environment               = var.environment
  vpc_id                    = module.my_vpc.vpc_id
  private_subnets_cidr      = local.db_private_subnets_cidr
  availability_zones        = local.availability_zones
  allowed_security_group_id = module.api.api_security_group_id
  database_name             = var.database_name
  database_username         = var.database_username
  database_password         = var.database_password
}

/** Accounts **/

resource "aws_iam_user" "deployer" {
  name = "github-deployer-${var.environment}"
}

resource "aws_iam_user" "relayer" {
  name = "relayer-queuer-${var.environment}"
}

resource "aws_iam_user_policy" "create_invalidations" {
  user   = aws_iam_user.deployer.name
  policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        Action   = "cloudfront:CreateInvalidation"
        Effect   = "Allow"
        Resource = [
          module.front.distribution.arn,
        ]
      },
    ]
  })
}

/** DNZ zone & records **/

// must be imported before `apply` on a clean Terraform setup
// import aws_route53_zone.dns_zone Z035081727G7V4QRJYNVI
resource "aws_route53_zone" "dns_zone" {
  name = var.domain
}

resource "aws_route53_record" "api_balancer" {
  zone_id = aws_route53_zone.dns_zone.id
  name    = local.api_service_url
  type    = "A"

  alias {
    name                   = module.api.balancer.dns_name
    zone_id                = module.api.balancer.zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "grafana_balancer" {
  zone_id = aws_route53_zone.dns_zone.id
  name    = local.grafana_service_url
  type    = "A"

  alias {
    name                   = module.grafana.balancer.dns_name
    zone_id                = module.grafana.balancer.zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "front_distribution" {
  zone_id = aws_route53_zone.dns_zone.id
  name    = local.front_service_url
  type    = "A"

  alias {
    name                   = module.front.distribution.domain_name
    zone_id                = module.front.distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

/** Security */

resource "aws_key_pair" "instances" {
  key_name   = local.instances_key_name
  public_key = var.instances_key
}


module "ami" {
  source = "./modules/ami"
}

/** Outputs */

output "current_ami_id" {
  value = module.ami.ami_id
}

output "api_public_ip" {
  value = module.api.public_ip
}

output "relayer_public_ip" {
  value = module.relayer.public_ip
}

output "grafana_public_ip" {
  value = module.grafana.public_ip
}

output "transactions_queue" {
  value = module.relayer.transactions_queue
}

output "events_queue" {
  value = module.relayer.events_queue
}

output "dead_transactions_queue" {
  value = module.relayer.dead_transactions_queue
}

output "dead_events_queue" {
  value = module.relayer.dead_events_queue
}
