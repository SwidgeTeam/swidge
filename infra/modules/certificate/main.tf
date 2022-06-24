terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

resource "aws_acm_certificate" "cert" {
  domain_name       = var.domain
  validation_method = "DNS"

  subject_alternative_names = [
    "*.${var.domain}"
  ]

  tags = {
    Environment = var.environment
  }

  lifecycle {
    create_before_destroy = true
  }
}

output "arn" {
  value = aws_acm_certificate.cert.arn
}