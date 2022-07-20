variable "environment" {
  type        = string
  description = "The Deployment environment"
}

variable "region" {
  type        = string
  description = "The region to launch the bastion host"
}

variable "vpc_id" {
  type        = string
  description = "The VPC ID"
}

variable "private_subnets_cidr" {
  type        = list(string)
  description = "The CIDR blocks for the private subnets"
}

variable "availability_zones" {
  type        = list(string)
  description = "The az that the resources will be launched"
}

variable "database_name" {
  type        = string
  description = "The database name"
}

variable "database_username" {
  type        = string
  description = "The database user"
}

variable "database_password" {
  type        = string
  description = "The database password"
}

variable "allowed_security_group_id" {
  type        = string
  description = "ID of the security group allowed to query the DB"
}
