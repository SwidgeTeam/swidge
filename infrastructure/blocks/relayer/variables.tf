variable "environment" {
  description = "The Deployment environment"
}

variable "region" {
  description = "The region to launch the bastion host"
}

variable "vpc_id" {
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

variable "instance_type" {
  type        = string
  description = "Instance type to be used"
}

variable "transactions_queue" {
  type        = string
  description = "Name of the queue for the processed transactions"
}

variable "relayer_account_arn" {
  type        = string
  description = "ARN of the account used to produce/consume transactions"
}