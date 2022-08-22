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

  ami_id            = var.ami_id
  name              = local.name
  instance_type     = var.instance_type
  environment       = var.environment
  subnets           = [element(module.api-subnets.public_subnets, 1)]
  security_group_id = aws_security_group.api_http_ssh.id
  key_name          = var.key_name
}

module "application_load_balancer" {
  source = "../../modules/alb"

  name              = local.name
  region            = var.region
  vpc_id            = var.vpc_id
  certificate_arn   = var.certificate_arn
  environment       = var.environment
  instances_id      = [element(module.api-instance.instances_id, 1)]
  subnets           = module.api-subnets.public_subnets
  health_check_path = "/health"
}

resource "aws_security_group" "api_http_ssh" {
  name        = "allow_http_ssh"
  description = "Allow HTTP & SSH into the instance"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Metrics for Prometheus"
    from_port   = 9209
    to_port     = 9209
    protocol    = "tcp"
    cidr_blocks = [for ip in var.scrapper_ips : "${ip}/32"]
  }

  ingress {
    description = "SSH from anywhere"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "allow_http_ssh"
  }
}

output "api_security_group_id" {
  value = aws_security_group.api_http_ssh.id
}

output "balancer" {
  value = module.application_load_balancer.balancer
}

output "public_ip" {
  value = module.api-instance.instances_ip
}