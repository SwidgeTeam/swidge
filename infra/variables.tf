variable "environment" {
  description = "The Deployment environment"
}

variable "vpc_cidr" {
  description = "The CIDR block of the vpc"
}

variable "region" {
  description = "AWS Deployment region"
  default     = "us-east-1"
}

variable "aws_access_key" {
  description = "AWS Access Key"
}

variable "aws_secret_key" {
  description = "AWS Secret Key"
}

variable "domain" {
  type        = string
  description = "Domain name"
}

variable "base_url" {
  type        = string
  description = "Base URL to use on the exposed services"
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