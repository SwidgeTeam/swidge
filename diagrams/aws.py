from diagrams import Diagram, Cluster
from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS, ElasticacheForRedis
from diagrams.aws.network import ALB, Route53, CloudFront
from diagrams.aws.storage import SimpleStorageServiceS3Bucket

with Diagram("AWS Cloud", show=False):

    dns = Route53("dns")

    with Cluster('VPC'):
        alb = ALB("balancer")

        with Cluster('AZ'):

            with Cluster('Public subnet #1'):
                api = EC2('api')

            with Cluster('Private subnet #2'):
                relayer = EC2('relayer')
                redis = ElasticacheForRedis('redis')

            with Cluster('Private subnet #3'):
                db = RDS('db')

    distribution_landing = CloudFront('distribution')
    distribution_app = CloudFront('distribution')

    bucket_landing = SimpleStorageServiceS3Bucket('landing')
    bucket_app = SimpleStorageServiceS3Bucket('app')

    dns >> alb >> api >> db

    redis << relayer >> api

    dns >> [distribution_landing, distribution_app]

    distribution_landing >> bucket_landing
    distribution_app >> bucket_app