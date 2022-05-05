const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const ignoredFiles = require('react-dev-utils/ignoredFiles');
const redirectServedPath = require('react-dev-utils/redirectServedPathMiddleware');
const { createProxyMiddleware } = require('http-proxy-middleware');
const paths = require('./paths');
const getServerHTTPSConfig = require('./getServerHTTPSConfig');

const host = process.env.HOST || '0.0.0.0';
const sockHost = process.env.WDS_SOCKET_HOST;
const sockPath = process.env.WDS_SOCKET_PATH; // default: '/ws'
const sockPort = process.env.WDS_SOCKET_PORT;

/**
 * @param {import("webpack-dev-server").ProxyConfigArray} [proxy]
 * @param {string} [allowedHost]
 * @returns {import("webpack-dev-server").Configuration}
 */
function createDevServerConfig(proxy, allowedHost) {
  const disableFirewall = !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true';
  return {
    allowedHosts: disableFirewall ? 'all' : [allowedHost],
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
    compress: true,
    static: {
      directory: paths.appPublic,
      publicPath: [paths.publicUrlOrPath],
      watch: {
        ignored: ignoredFiles(paths.appSrc),
      },
    },
    client: {
      webSocketURL: {
        hostname: sockHost,
        pathname: sockPath,
        port: sockPort,
      },
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    devMiddleware: {
      publicPath: paths.publicUrlOrPath.slice(0, -1),
    },

    /**
     * Use instead of deprecated `https`
     * @see https://webpack.js.org/configuration/dev-server/#devserverserver
     * @see https://webpack.js.org/configuration/dev-server/#devserverhttps
     */
    server: getServerHTTPSConfig(),

    host,
    historyApiFallback: {
      disableDotRule: true,
      index: paths.publicUrlOrPath,
    },
    // `proxy` is run between `before` and `after` `webpack-dev-server` hooks
    proxy,
    setupMiddlewares(middlewares, devServer) {
      if (!devServer) throw new Error('No <devServer> param passed');

      /**
       * Keep `evalSourceMapMiddleware`
       * middlewares before `redirectServedPath` otherwise will not have any effect
       * This lets us fetch source contents from webpack for the error overlay
       */
      middlewares.unshift({
        name: 'keep-evalSourceMapMiddleware',
        middleware: evalSourceMapMiddleware(devServer),
      });

      /**
       * This registers user provided middleware for proxy reasons
       * Moved here from `paths.proxySetup` (src/setupProxy.js)
       */
      if (typeof process.env.API_PROXY_TARGET === 'string' && typeof process.env.API_PROXY_COOKIE === 'string')
        middlewares.unshift({
          name: 'user-provided-api-proxy',
          path: '/api/',
          middleware: createProxyMiddleware({
            target: process.env.API_PROXY_TARGET,
            changeOrigin: true,
            headers: {
              Cookie: `session_id=${process.env.API_PROXY_COOKIE}`,
            },
          }),
        });

      // Redirect to `PUBLIC_URL` or `homepage` from `package.json` if url not match
      middlewares.push({
        name: 'redirect-to-public-url',
        middleware: redirectServedPath(paths.publicUrlOrPath),
      });

      /**
       * This service worker file is effectively a 'no-op' that will reset any
       * previous service worker registered for the same host:port combination.
       * We do this in development to avoid hitting the production cache if
       * it used the same host and port.
       *
       * TODO: Rewrite to decide whether using Service Worker IN APP CODE, NOT DEV WEBPACK SCRIPTS
       * TODO: @see https://github.com/serguun42/Social-Picker-Vue/blob/master/src/util/cache.js#L34
       */
      middlewares.push({
        name: 'noop-service-worker',
        middleware: noopServiceWorkerMiddleware(paths.publicUrlOrPath),
      });

      return middlewares;
    },
  };
};

module.exports = createDevServerConfig;
