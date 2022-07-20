module "db_subnets" {
  source = "../../modules/private_subnets"

  name                 = "db"
  vpc_id               = var.vpc_id
  environment          = var.environment
  availability_zones   = var.availability_zones
  private_subnets_cidr = var.private_subnets_cidr
}

resource "aws_db_subnet_group" "private_subnet" {
  name        = "rds-private-${var.environment}"
  description = "Private subnets for RDS instance"
  subnet_ids  = module.db_subnets.private_subnets.*.id
}

resource "aws_rds_cluster" "cluster" {
  cluster_identifier      = "aurora-cluster-${var.environment}"
  engine                  = "aurora-mysql"
  engine_mode             = "serverless"
  availability_zones      = var.availability_zones
  database_name           = var.database_name
  master_username         = var.database_username
  master_password         = var.database_password
  backup_retention_period = 5
  preferred_backup_window = "05:00-07:00"
  db_subnet_group_name    = aws_db_subnet_group.private_subnet.name
  skip_final_snapshot     = true
  vpc_security_group_ids  = [aws_security_group.rds.id]

  scaling_configuration {
    auto_pause               = true
    min_capacity             = 1
    max_capacity             = 2
    seconds_until_auto_pause = 300
    timeout_action           = "ForceApplyCapacityChange"
  }
}

/** security group **/

resource "aws_security_group" "rds" {
  name        = "allow_mysql"
  description = "Allow MySQL traffic to RDS"
  vpc_id      = var.vpc_id

  tags = {
    Name = "allow_mysql"
  }
}

resource "aws_security_group_rule" "ingress" {
  type                     = "ingress"
  from_port                = 3306
  to_port                  = 3306
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = var.allowed_security_group_id
}

resource "aws_security_group_rule" "egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.rds.id
}
