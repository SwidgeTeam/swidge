locals {
  name = "relayer"
}

module "relayer-subnets" {
  source = "../../modules/public_subnets"

  name                = local.name
  region              = var.region
  environment         = var.environment
  vpc_id              = var.vpc_id
  public_subnets_cidr = var.public_subnets_cidr
  availability_zones  = var.availability_zones
  internet_gateway_id = var.internet_gateway_id
}

module "relayer-instance" {
  source = "../../modules/instance"

  name              = local.name
  instance_type     = var.instance_type
  environment       = var.environment
  subnets           = [element(module.relayer-subnets.public_subnets, 1)]
  security_group_id = aws_security_group.relayer-sg.id
  key_name          = var.key_name
}

resource "aws_sqs_queue" "transactions" {
  name                        = var.transactions_queue
  fifo_queue                  = true
  content_based_deduplication = true
  delay_seconds               = 0
  message_retention_seconds   = 345600
  receive_wait_time_seconds   = 10
  visibility_timeout_seconds  = 60

  tags = {
    Environment = var.environment
  }
}

resource "aws_sqs_queue_policy" "transactions" {
  queue_url = aws_sqs_queue.transactions.id
  policy    = <<EOP
    {
      "Version": "2008-10-17",
      "Id": "__default_policy_ID",
      "Statement": [
        {
          "Sid": "__sender_statement",
          "Effect": "Allow",
          "Principal": {
            "AWS": "${var.relayer_account_arn}"
          },
          "Action": "SQS:SendMessage",
          "Resource": "${aws_sqs_queue.transactions.arn}"
        },
        {
          "Sid": "__receiver_statement",
          "Effect": "Allow",
          "Principal": {
            "AWS": "${var.relayer_account_arn}"
          },
          "Action": [
            "SQS:ChangeMessageVisibility",
            "SQS:DeleteMessage",
            "SQS:ReceiveMessage"
          ],
          "Resource": "${aws_sqs_queue.transactions.arn}"
        }
      ]
    }
  EOP
}

resource "aws_security_group" "relayer-sg" {
  name        = "allow_ssh"
  description = "Allow SSH into the instance"
  vpc_id      = var.vpc_id

  ingress {
    description = "SSH from anywhere"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "allow_ssh"
  }
}

output "security_group_id" {
  value = aws_security_group.relayer-sg.id
}

output "public_ip" {
  value = module.relayer-instance.instances_ip
}