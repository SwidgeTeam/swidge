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
    ]
}
