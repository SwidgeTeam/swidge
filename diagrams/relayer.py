from diagrams import Diagram, Cluster
from diagrams.custom import Custom
from diagrams.programming.flowchart import Database
from diagrams.programming.flowchart import PredefinedProcess
from diagrams.aws.integration import SimpleQueueServiceSqsQueue
from diagrams.onprem.compute import Server

with Diagram("", show=False, direction="LR", filename="relayer"):
    blockchain = Custom('blockchain', './img/block.png')
    queue = SimpleQueueServiceSqsQueue('queue')
    db = Database('db')
    multichain_api = Server('Multichain API')

    with Cluster('Relayer'):
        listener = PredefinedProcess('events listener')
        consumer = PredefinedProcess('job consumer')
        bridge_listener = PredefinedProcess('Multichain listener')

        listener << blockchain << consumer

        listener >> queue
        consumer << queue

        db << [consumer, bridge_listener]

        bridge_listener << multichain_api

