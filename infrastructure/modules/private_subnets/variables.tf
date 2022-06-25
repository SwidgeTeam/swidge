variable "name" {
  type        = string
  description = "Name of resource for which the subnets are dedicated"
}

variable "environment" {
  type        = string
  description = "The Deployment environment"
}

variable "vpc_id" {
  type        = string
  description = "The VPC ID"
}

variable "private_subnets_cidr" {
  type        = list(string)
  description = "The CIDR block for the private subnet"
}

variable "availability_zones" {
  type        = list(string)
  description = "The az that the resources will be launched"
}