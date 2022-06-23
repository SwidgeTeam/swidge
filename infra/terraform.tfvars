//AWS
region      = "us-west-2"
environment = "test"

/* module networking */
vpc_cidr                = "10.0.0.0/16"
api_public_subnets_cidr = ["10.0.0.0/20"]
db_private_subnets_cidr = ["10.0.16.0/20"]