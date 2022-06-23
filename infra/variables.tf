variable "region" {
  description = "AWS Deployment region"
  default     = "us-east-1"
}

variable "environment" {
  description = "The Deployment environment"
}

variable "vpc_cidr" {
  description = "The CIDR block of the vpc"
}
