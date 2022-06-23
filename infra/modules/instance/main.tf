resource "aws_network_interface" "net_interface" {
  subnet_id         = element(var.subnets.*.id, count.index)
  count             = length(var.subnets)
  private_ips_count = 1

  tags = {
    Name = "${var.name}_network_interface"
  }
}

module "ami" {
  source = "../ami"
}

resource "aws_instance" "instance" {
  ami           = module.ami.ami_id
  instance_type = "t2.micro"
  count         = length(var.subnets)

  network_interface {
    network_interface_id = element(aws_network_interface.net_interface.*.id, count.index)
    device_index         = 0
  }

  tags = {
    Name        = "${var.environment}-${var.name}-instance"
    Environment = var.environment
  }
}