resource "aws_s3_bucket" "front_bucket" {
  bucket = "swidge-front-${var.environment}"
}

resource "aws_s3_bucket_acl" "front_acl" {
  bucket = aws_s3_bucket.front_bucket.id
  acl    = "private"
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
  comment             = "Some comment"
  default_root_object = "index.html"

  aliases = ["app.test.swidge.xyz"]

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
    cloudfront_default_certificate = true
    acm_certificate_arn            = var.certificate_arn
    ssl_support_method             = "sni-only"
  }
}