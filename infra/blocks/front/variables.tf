variable "environment" {
  description = "The Deployment environment"
}

variable "certificate_arn" {
  type        = string
  description = "ARN of the certificate to use when SSL is needed"
}