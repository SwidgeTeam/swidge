variable "environment" {
  description = "The Deployment environment"
}

variable "region" {
  description = "The region to launch the bastion host"
}

variable "vpc_cidr" {
  description = "The CIDR block of the vpc"
}

variable "public_subnets_cidr" {
  type        = list(string)
  description = "The CIDR block for the public subnet for API"
}

variable "availability_zones" {
  type        = list(string)
  description = "The az that the resources will be launched"
}