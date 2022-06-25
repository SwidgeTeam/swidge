variable "environment" {
  type        = string
  description = "The Deployment environment"
}

variable "service_url" {
  type        = string
  description = "Service's URL to be used"
}

variable "certificate_arn" {
  type        = string
  description = "ARN of the certificate to use when SSL is needed"
}

variable "deployer_account_arn" {
  type        = string
  description = "ARN of the account used to deploy"
}