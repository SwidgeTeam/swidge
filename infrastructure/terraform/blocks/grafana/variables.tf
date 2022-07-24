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

variable "internet_gateway_id" {
  type        = string
  description = "The Internet gateway ID"
}

variable "public_subnets_cidr" {
  type        = list(string)
  description = "The CIDR block for the public subnet"
}

variable "availability_zones" {
  type        = list(string)
  description = "The az that the resources will be launched"
}

variable "certificate_arn" {
  type        = string
  description = "ARN of the certificate to use when SSL is needed"
}

variable "instance_type" {
  type        = string
  description = "Instance type to be used"
}

variable "key_name" {
  type        = string
  description = "Name of the keypair to use"
}

variable "allowed_security_group_ids" {
  type        = list(string)
  description = "IDs of the security groups allowed to connect to Loki"
}
