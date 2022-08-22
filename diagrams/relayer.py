from diagrams import Diagram, Cluster, Edge
from diagrams.custom import Custom
from diagrams.programming.flowchart import Database
from diagrams.programming.flowchart import PredefinedProcess
from diagrams.aws.integration import SimpleQueueServiceSqsQueue, SimpleNotificationServiceSnsEmailNotification
from diagrams.onprem.compute import Server
from diagrams.programming.flowchart import Decision

with Diagram("", show=False, direction="LR", filename="relayer"):
    blockchain_origin = Custom('origin blockchain', './img/block.png')
    blockchain_destination = Custom('destination blockchain', './img/block.png')

    events_queue = SimpleQueueServiceSqsQueue('events queue')
    transactions_queue = SimpleQueueServiceSqsQueue('transactions queue')

    events_dlq = SimpleQueueServiceSqsQueue('dead events queue')
    transactions_dlq = SimpleQueueServiceSqsQueue('dead transactions queue')

    dead_event_topic = SimpleNotificationServiceSnsEmailNotification('SNS email notification')
    dead_transaction_topic = SimpleNotificationServiceSnsEmailNotification('SNS email notification')

    db = Database('db')

    multichain_api = Server('Multichain API')

    requires_tx = Decision('if requires destination tx')

    with Cluster('Relayer'):
        with Cluster('Events listener'):
            router_listener = PredefinedProcess('router listener')
            multichain_listener = PredefinedProcess('multichain listener')

        with Cluster('Events consumer'):
            event_consumer = PredefinedProcess('events consumer')

        with Cluster('Transactions consumer'):
            transaction_consumer = PredefinedProcess('transactions consumer')

    blockchain_origin >> Edge(color="black") >> [router_listener, multichain_listener]

    multichain_listener >> Edge(color="black") << multichain_api

    [router_listener, multichain_listener] >> Edge(color="black") >> events_queue

    events_queue >> Edge(color="black") >> event_consumer

    event_consumer >> Edge(color="black") >> requires_tx >> Edge(color="black") >> transactions_queue

    transactions_queue >> Edge(color="black") >> transaction_consumer >> Edge(color="black") >> blockchain_destination

    event_consumer >> Edge(color="black") << db

    events_queue >> Edge(color="black", label="after X fails") >> events_dlq >> dead_event_topic
    transactions_queue >> Edge(color="black", label="after X fails") >> transactions_dlq >> dead_transaction_topic
