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

variable "api_public_subnets_cidr" {
  type        = list(string)
  description = "The CIDR block for the API public subnet"
}

variable "db_private_subnets_cidr" {
  type        = list(string)
  description = "The CIDR block for the database private subnet"
}