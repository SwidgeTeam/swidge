from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS
from diagrams.aws.network import ALB, Route53, CloudFront
from diagrams.aws.storage import SimpleStorageServiceS3Bucket
from diagrams.aws.integration import SQS
from diagrams.custom import Custom

with Diagram("Infrastructure", show=False, direction="TB"):
    dns = Route53("dns")

    with Cluster('VPC', direction="TB"):
        with Cluster('Relayer'):
            with Cluster('Private subnet 2'):
                relayer_instance = EC2('instance')

        with Cluster('API'):
            api_alb = ALB("balancer")
            with Cluster('Public subnet 2'):
                api_instance = EC2('instance')
            with Cluster('Private subnet 1'):
                db = RDS('db')
            api_instance >> db
            api_alb >> api_instance

        with Cluster('Stats'):
            stats_alb = ALB("balancer")
            with Cluster('Public subnet 1'):
                stats_instance = EC2('instance')
            relayer_instance >> api_alb
            stats_alb >> stats_instance

        queues = SQS('queues')
        relayer_instance >> Edge(color="black") << queues

    with Cluster('Blockchains'):
        chainX = Custom('chain X', './img/block.png')
        chainY = Custom('chain Y', './img/block.png')
        chains = [chainX, chainY]
        relayer_instance >> Edge(color="black") << chains

    with Cluster('Landing'):
        distribution_landing = CloudFront('distribution')
        bucket_landing = SimpleStorageServiceS3Bucket('bucket')
        distribution_landing >> bucket_landing

    with Cluster('App'):
        distribution_app = CloudFront('distribution')
        bucket_app = SimpleStorageServiceS3Bucket('bucket')
        distribution_app >> bucket_app

    dns >> [distribution_landing, distribution_app, api_alb, stats_alb]

