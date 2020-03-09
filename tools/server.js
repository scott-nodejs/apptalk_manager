const express = require('express')
const webpack = require('webpack')
const opn = require('opn')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const compress = require('compression')
const proxy = require('http-proxy-middleware')
const webpackConfig = require('./config/webpack.dev.config')
const KiteConfig = require('../kite.config')
const app = express()
const port = KiteConfig.admin.port
const compiler = webpack(webpackConfig)

app.use(compress())

const devMiddleware = webpackDevMiddleware(compiler, {
  quiet: false,
  noInfo: false,
  lazy: false,
  headers: { 'Access-Control-Allow-Origin': '*' },
  stats: 'errors-only'
})

devMiddleware.waitUntilValid(() => {
  opn('http://localhost:' + port)
})

const hotMiddleware = webpackHotMiddleware(compiler, {
  path: '/__webpack_hmr',
  log: false
})

var restream = function(proxyReq, req, res, options) {
    if (req.body) {
        let bodyData = JSON.stringify(req.body);
        // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
        proxyReq.setHeader('Content-Type','application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        // stream the content
        proxyReq.write(bodyData);
    }
}

for (let x in KiteConfig.admin.proxy) {
  let obj = KiteConfig.admin.proxy[x]
  obj["onProxyReq"] = restream
  app.use(proxy(x, obj))
}

app.use(devMiddleware)
app.use(hotMiddleware)
app.use(express.static(KiteConfig.admin.basePath))

app.listen(port, () => {
})
