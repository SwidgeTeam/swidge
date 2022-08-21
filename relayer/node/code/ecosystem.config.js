module.exports = {
    apps: [
        {
            name: "multichain-listener",
            cwd: "/code/www",
            script: "./dist/src/multichain-listener.js",
            watch: true,
        },
        {
            name: "router-listener",
            cwd: "/code/www",
            script: "./dist/src/router-listener.js",
            watch: true,
        },
        {
            name: "events-consumer",
            cwd: "/code/www",
            script: "./dist/src/events-consumer.js",
            watch: true,
        },
        {
            name: "transactions-consumer",
            cwd: "/code/www",
            script: "./dist/src/transactions-consumer.js",
            watch: true,
        },
        {
            name: 'PM2 Exporter',
            cwd: "/code/exporter",
            script: "./exporter.js",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
        }
    ]
}
