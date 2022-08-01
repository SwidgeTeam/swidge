from diagrams import Diagram, Cluster
from diagrams.aws.storage import SimpleStorageServiceS3Bucket
from diagrams.aws.compute import EC2
from diagrams.onprem.vcs import Github
from diagrams.onprem.ci import GithubActions

with Diagram("", show=False, direction="LR", filename="deploys"):
    repository = Github('monorepo')

    api_action = GithubActions('api workflow')
    front_action = GithubActions('front workflow')
    relayer_action = GithubActions('relayer workflow')

    repository >> [front_action, api_action, relayer_action]

    front_bucket = SimpleStorageServiceS3Bucket('bucket')
    api_instance = EC2('instance')
    relayer_instance = EC2('instance')

    front_action >> front_bucket,
    api_action >> api_instance,
    relayer_action >> relayer_instance,
