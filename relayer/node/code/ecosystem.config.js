module.exports = {
    apps: [
        {
            name: "queue-consumer",
            cwd: "/code/www",
            script: "./dist/src/queue-consumer.js",
            watch: true,
        },
        {
            name: "multichain-listener",
            cwd: "/code/www",
            script: "./dist/src/multichain-listener.js",
            watch: true,
        },
        {
            name: "events-listener",
            cwd: "/code/www",
            script: "./dist/src/events-listener.js",
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
