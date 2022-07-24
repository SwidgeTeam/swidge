locals {
  name = "grafana"
}

module "grafana-subnets" {
  source = "../../modules/public_subnets"

  name                = local.name
  region              = var.region
  environment         = var.environment
  vpc_id              = var.vpc_id
  public_subnets_cidr = var.public_subnets_cidr
  availability_zones  = var.availability_zones
  internet_gateway_id = var.internet_gateway_id
}

module "grafana-instance" {
  source = "../../modules/instance"

  name              = local.name
  instance_type     = var.instance_type
  environment       = var.environment
  subnets           = [element(module.grafana-subnets.public_subnets, 1)]
  security_group_id = aws_security_group.grafana_sg.id
  key_name          = var.key_name
}

module "application_load_balancer" {
  source = "../../modules/alb"

  name            = local.name
  region          = var.region
  vpc_id          = var.vpc_id
  certificate_arn = var.certificate_arn
  environment     = var.environment
  instances_id    = [element(module.grafana-instance.instances_id, 1)]
  subnets         = module.grafana-subnets.public_subnets
}

/** security group **/

resource "aws_security_group" "grafana_sg" {
  name        = "allow_grafana_loki"
  description = "Allow MySQL traffic to Grafana and Loki"
  vpc_id      = var.vpc_id

  tags = {
    Name = "allow_grafana_loki"
  }
}

resource "aws_security_group_rule" "ingress_loki" {
  type                     = "ingress"
  from_port                = 3100
  to_port                  = 3100
  protocol                 = "tcp"
  security_group_id        = aws_security_group.grafana_sg.id
  count                    = length(var.allowed_security_group_ids)
  source_security_group_id = element(var.allowed_security_group_ids, count.index)
}

resource "aws_security_group_rule" "ingress_http" {
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.grafana_sg.id
}

resource "aws_security_group_rule" "ingress_ssh" {
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.grafana_sg.id
}

resource "aws_security_group_rule" "egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.grafana_sg.id
}

output "balancer" {
  value = module.application_load_balancer.balancer
}

output "public_ip" {
  value = module.grafana-instance.instances_ip
}