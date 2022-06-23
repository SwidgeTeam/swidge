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

// create application load balance
resource "aws_lb" "api-balancer" {
  name               = "${var.environment}-alb-${local.name}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.http_https.id]
  subnets            = [for subnet in module.api-subnets.public_subnets : subnet.id]

  tags = {
    Environment = var.environment
  }
}

// define an instances target group
resource "aws_lb_target_group" "api-target-group" {
  name     = "api-instances-group"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id
}

// add instance to target group
resource "aws_lb_target_group_attachment" "api-instances-target-group" {
  target_group_arn = aws_lb_target_group.api-target-group.arn
  target_id        = element(module.api-instance.instances_id, 1)
  port             = 80
}

// set HTTP listener on LB
resource "aws_alb_listener" "http-alb-listener" {
  load_balancer_arn = aws_lb.api-balancer.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api-target-group.arn
  }
}

// set HTTPS listener on LB
resource "aws_lb_listener" "https-alb-listener" {
  load_balancer_arn = aws_lb.api-balancer.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api-target-group.arn
  }
}


// security group for alb
resource "aws_security_group" "http_https" {
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
