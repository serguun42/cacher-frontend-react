process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

process.on('unhandledRejection', (err) => {
  throw err;
});

// Ensure environment variables are read.
require('../config/getClientEnvironment');

const fs = require('fs');
const chalk = require('react-dev-utils/chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const clearConsole = require('react-dev-utils/clearConsole');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const { choosePort, createCompiler, prepareProxy, prepareUrls } = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');
const paths = require('../config/paths');
const configFactory = require('../config/webpack.config');
const createDevServerConfig = require('../config/webpack.createDevServerConfig');
const useYarn = fs.existsSync(paths.yarnLockFile);
const isInteractive = process.stdout.isTTY;

if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) process.exit(1);

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
const { checkBrowsers } = require('react-dev-utils/browsersHelper');

checkBrowsers(paths.appPath, isInteractive)
  .then(() => {
    // We attempt to use the default port but if it is busy, we offer the user to
    // run on a different port. `choosePort()` Promise resolves to the next free port.
    return choosePort(HOST, DEFAULT_PORT);
  })
  .then((port) => {
    if (port == null) {
      // We have not found a port.
      return;
    }

    const config = configFactory('development');
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
    const appName = require(paths.appPackageJson).name;

    const useTypeScript = fs.existsSync(paths.appTsConfig);
    const urls = prepareUrls(protocol, HOST, port, paths.publicUrlOrPath.slice(0, -1));

    // Create a webpack compiler that is configured with custom messages.
    const compiler = createCompiler({
      appName,
      config,
      urls,
      useYarn,
      useTypeScript,
      webpack,
    });

    // Load proxy config
    const proxySetting = require(paths.appPackageJson).proxy;
    const proxyConfig = prepareProxy(proxySetting, paths.appPublic, paths.publicUrlOrPath);

    /**
     * Serve webpack assets generated by the compiler over a web server.
     * @type {import("webpack-dev-server").Configuration}
     */
    const serverConfig = {
      ...createDevServerConfig(proxyConfig, urls.lanUrlForConfig),
      host: HOST,
      port,
    };

    const devServer = new WebpackDevServer(serverConfig, compiler);

    // Launch WebpackDevServer
    devServer
      .start()
      .then(() => {
        if (isInteractive) clearConsole();

        console.log(chalk.cyan('Starting the development server...\n'));

        // Do not open browser on `npm start` if not specifically stated in .env
        if (process.env.OPEN_BROWSER_ON_START) openBrowser(urls.localUrlForBrowser);
      })
      .catch((err) => {
        if (err && err.message) console.error(err.message);

        process.exit(1);
      });

    ['SIGINT', 'SIGTERM'].forEach(function (sig) {
      process.on(sig, function () {
        devServer.close();
        process.exit();
      });
    });

    if (process.env.CI !== 'true') {
      // Gracefully exit when stdin ends
      process.stdin.on('end', function () {
        devServer.close();
        process.exit();
      });
    }
  })
  .catch((err) => {
    if (err && err.message) console.error(err.message);

    process.exit(1);
  });
