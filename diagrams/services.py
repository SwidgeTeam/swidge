from diagrams import Diagram, Cluster
from diagrams.programming.framework import Vue
from diagrams.programming.language import Nodejs
from diagrams.onprem.monitoring import Grafana
from diagrams.onprem.logging import Loki
from diagrams.onprem.monitoring import Prometheus
from diagrams.onprem.database import Mysql
from diagrams.onprem.client import Users

with Diagram("Services", show=False, direction="LR"):
    with Cluster(''):
        relayer = Nodejs('relayer')
        api = Nodejs('API')
    grafana = Grafana('Grafana')

    loki = Loki('Loki')
    prom = Prometheus('Prometheus')

    db = Mysql('db')

    api >> db

    [relayer, api] >> loki
    [api] << prom

    [loki, prom] << grafana

    app = Vue('app')

    users = Users('')

    users >> [api, grafana, app]
