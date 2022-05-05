const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const chalk = require('react-dev-utils/chalk');
const paths = require('./paths');

/**
 * Ensure the certificate and key provided are valid and if not
 * throw an easy to debug error
 * @param {{ cert: Buffer, key: Buffer, keyFilePath: string, crtFilePath: string }} param0
 */
function validateKeyAndCerts({ cert, key, keyFilePath, crtFilePath }) {
  let encrypted;

  // publicEncrypt will throw an error with an invalid cert
  try {
    encrypted = crypto.publicEncrypt(cert, Buffer.from('test'));
  } catch (err) {
    throw new Error(`The certificate "${chalk.yellow(crtFilePath)}" is invalid.\n${err.message}`);
  }

  // privateDecrypt will throw an error with an invalid key
  try {
    crypto.privateDecrypt(key, encrypted);
  } catch (err) {
    throw new Error(`The certificate key "${chalk.yellow(keyFilePath)}" is invalid.\n${err.message}`);
  }
}

/**
 * Read file and throw an error if it doesn't exist
 * @param {string} file
 * @param {string} type
 * @returns
 */
function readFileSyncWithType(file, type) {
  if (!fs.existsSync(file)) {
    throw new Error(
      `You specified ${chalk.cyan(type)} in your env, but the file "${chalk.yellow(file)}" can't be found.`
    );
  }
  return fs.readFileSync(file);
}

/**
 * Get the https config
 * Return cert files if provided in env, otherwise just true or false
 *
 * @returns {import("webpack-dev-server").ServerConfiguration}
 */
function getHttpsConfig() {
  const { SSL_CRT_FILE, SSL_KEY_FILE, HTTPS } = process.env;
  const isHttps = HTTPS === 'true';

  if (isHttps && SSL_CRT_FILE && SSL_KEY_FILE) {
    const crtFilePath = path.resolve(paths.appPath, SSL_CRT_FILE);
    const keyFilePath = path.resolve(paths.appPath, SSL_KEY_FILE);
    const config = {
      cert: readFileSyncWithType(crtFilePath, 'SSL_CRT_FILE'),
      key: readFileSyncWithType(keyFilePath, 'SSL_KEY_FILE'),
    };

    validateKeyAndCerts({ ...config, keyFilePath, crtFilePath });
    return {
      type: 'https',
      options: config,
    };
  } else return { type: 'http' };
}

module.exports = getHttpsConfig;
