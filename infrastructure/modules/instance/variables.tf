variable "environment" {
  description = "The Deployment environment"
}

variable "name" {
  description = "Name of the instance"
}

variable "instance_type" {
  description = "Type of instance to be used"
}

variable "subnets" {
  type = list(object({
    id : string
  }))
  description = "Subnets to create the instance on"
}

variable "security_group_id" {
  type = string
  description = "Security group ID to attach to the instance"
}
