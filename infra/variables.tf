variable "region" {
  description = "AWS Deployment region"
  default = "us-east-1"
}

variable "environment" {
  description = "The Deployment environment"
}

variable "aws_ami_id" {
  default = "ami-09a41e26df464c548" # Debian 11
  description = "ID of the Amazon Machine Image to be used for the instances"
}

//Networking
variable "vpc_cidr" {
  description = "The CIDR block of the vpc"
}

variable "public_subnets_cidr" {
  type        = list(string)
  description = "The CIDR block for the public subnet"
}

variable "private_subnets_cidr" {
  type        = list(string)
  description = "The CIDR block for the private subnet"
}