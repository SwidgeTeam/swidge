locals {
  name = "relayer"
}

module "relayer-subnets" {
  source = "../../modules/public_subnets"

  name                = local.name
  region              = var.region
  environment         = var.environment
  vpc_id              = var.vpc_id
  public_subnets_cidr = var.public_subnets_cidr
  availability_zones  = var.availability_zones
  internet_gateway_id = var.internet_gateway_id
}

module "relayer-instance" {
  source = "../../modules/instance"

  name              = local.name
  instance_type     = var.instance_type
  environment       = var.environment
  subnets           = [element(module.relayer-subnets.public_subnets, 1)]
  security_group_id = aws_security_group.relayer-sg.id
}

resource "aws_security_group" "relayer-sg" {
  name        = "allow_ssh"
  description = "Allow SSH into the instance"
  vpc_id      = var.vpc_id

  ingress {
    description = "SSH from anywhere"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "allow_ssh"
  }
}
