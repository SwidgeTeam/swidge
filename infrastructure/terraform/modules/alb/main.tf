// create application load balance
resource "aws_lb" "balancer" {
  name               = "${var.environment}-alb-${var.name}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.http_https.id]
  subnets            = [for subnet in var.subnets.* : subnet.id]

  tags = {
    Environment = var.environment
  }
}

// define instances target group
resource "aws_lb_target_group" "target-group" {
  name     = "${var.name}-instances-group"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id
}

// add instance to target group
resource "aws_lb_target_group_attachment" "instances-target-group" {
  count            = length(var.instances_id)
  target_group_arn = aws_lb_target_group.target-group.arn
  target_id        = element(var.instances_id, count.index)
  port             = 80
}

// set HTTP listener
resource "aws_alb_listener" "http-alb-listener" {
  load_balancer_arn = aws_lb.balancer.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

// set HTTPS listener
resource "aws_lb_listener" "https-alb-listener" {
  load_balancer_arn = aws_lb.balancer.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.target-group.arn
  }
}


// security group for alb
resource "aws_security_group" "http_https" {
  name        = "allow_http_https_${var.name}"
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
    Name = "allow_http_https_${var.name}"
  }
}

output "balancer" {
  value = aws_lb.balancer
}