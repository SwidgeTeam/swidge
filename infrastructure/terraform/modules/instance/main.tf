resource "aws_network_interface" "net_interface" {
  subnet_id         = element(var.subnets.*.id, count.index)
  count             = length(var.subnets)
  private_ips_count = 1
  security_groups   = [var.security_group_id]

  tags = {
    Name = "${var.name}_network_interface"
  }
}

resource "aws_instance" "instance" {
  ami           = var.ami_id
  instance_type = var.instance_type
  count         = length(var.subnets)
  key_name      = var.key_name

  network_interface {
    network_interface_id = element(aws_network_interface.net_interface.*.id, count.index)
    device_index         = 0
  }

  tags = {
    Name        = "${var.environment}-${var.name}-instance"
    Environment = var.environment
  }
}

output "instances_id" {
  value = aws_instance.instance.*.id
}

output "instances_ip" {
  value = aws_instance.instance.*.public_ip
}