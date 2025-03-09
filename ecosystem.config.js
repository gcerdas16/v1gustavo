module.exports = {
    apps: [
        {
            name: "base-bailey-json",
            script: "./dist/app.js",  // Apunta a tu archivo compilado en dist
            instances: "max",
            exec_mode: "cluster", // Esto permite ejecutar varios procesos para mejorar el rendimiento
        },
    ],
};
