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

variable "api_instance_type" {
  type        = string
  description = "API instance type"
}

variable "relayer_instance_type" {
  type        = string
  description = "Relayer instance type"
}

variable "grafana_instance_type" {
  type        = string
  description = "Grafana instance type"
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

variable "transactions_queue" {
  type        = string
  description = "Name of the queue for the processed transactions"
}

variable "instances_key" {
  type        = string
  description = "Public key of the key-pair to access the EC2 instances"
}