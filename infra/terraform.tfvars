//AWS
region      = "us-west-2"
environment = "test"

/* module networking */
vpc_cidr             = "10.0.0.0/16"
public_subnets_cidr  = ["10.0.0.0/20"] //List of Public subnet cidr range
private_subnets_cidr = ["10.0.16.0/20"] //List of private subnet cidr range