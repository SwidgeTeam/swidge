variable "name" {
  description = "Name of the service the LB is balancing"
}

variable "environment" {
  description = "The Deployment environment"
}

variable "region" {
  description = "The region to launch the bastion host"
}

variable "vpc_id" {
  description = "The VPC ID"
}

variable "subnets" {
  type = list(object({
    id : string
  }))
  description = "Subnets to attach to the ALB"
}

variable "instances_id" {
  type        = list(string)
  description = "The CIDR block for the public subnet"
}

variable "certificate_arn" {
  type        = string
  description = "ARN of the certificate to use when SSL is needed"
}