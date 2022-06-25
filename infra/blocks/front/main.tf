resource "aws_s3_bucket" "front_bucket" {
  bucket = "swidge-front-${var.environment}"
}

resource "aws_s3_bucket_acl" "front_acl" {
  bucket = aws_s3_bucket.front_bucket.id
  acl    = "private"
}

resource "aws_s3_bucket_policy" "allow_access_to_anyone" {
  bucket = aws_s3_bucket.front_bucket.id
  policy = <<EOP
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "AWS": "${var.deployer_account_arn}"
                },
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject",
                    "s3:DeleteObject"
                ],
                "Resource": "${aws_s3_bucket.front_bucket.arn}/*"
            },
            {
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "${aws_s3_bucket.front_bucket.arn}/*"
            },
            {
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:ListBucket",
                "Resource": "${aws_s3_bucket.front_bucket.arn}"
            }
        ]
    }
  EOP
}

locals {
  s3_origin_id = "front-${var.environment}"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.front_bucket.bucket_regional_domain_name
    origin_id   = local.s3_origin_id
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = [var.service_url]

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Environment = var.environment
  }

  viewer_certificate {
    acm_certificate_arn = var.certificate_arn
    ssl_support_method  = "sni-only"
  }
}

output "distribution" {
  value = aws_cloudfront_distribution.s3_distribution
}