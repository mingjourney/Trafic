const proxy = require('http-proxy-middleware').createProxyMiddleware;
module.exports = function (app) {
    app.use(proxy('/api/graphql', {
        target: 'http://127.0.0.1:8000/graphql',
        changeOrigin: true,
        pathRewrite: {
            '^/api/graphql': ''
        }
    }));
};