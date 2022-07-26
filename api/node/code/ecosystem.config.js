module.exports = {
    apps: [
        {
            name: "app",
            cwd: "/code/www",
            script: "./dist/src/main.js",
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
