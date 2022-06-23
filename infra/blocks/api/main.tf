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

  name              = local.name
  environment       = var.environment
  subnets           = [element(module.api-subnets.public_subnets, 1)]
  security_group_id = aws_security_group.api-sg.id
}

resource "aws_security_group" "api-sg" {
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

/*== Load balancer ==*/

resource "aws_lb" "api-balancer" {
  name               = "${var.environment}-alb-${local.name}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.https_https.id]
  subnets            = [for subnet in module.api-subnets.public_subnets : subnet.id]

  enable_deletion_protection = true

  tags = {
    Environment = var.environment
  }
}

resource "aws_security_group" "https_https" {
  name        = "allow_http_https"
  description = "Allow HTTP & HTTPS inbound connections"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
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
    Name = "allow_http_https"
  }
}
