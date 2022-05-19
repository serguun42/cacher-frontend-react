/* eslint-disable no-console */
/**
 * @param {any[]} messages
 * @returns {void}
 */
const LogMessageOrError = (...messages) => {
  if (process.env.NODE_ENV === 'production' && !localStorage.getItem('debug')) return;

  const containsError =
    messages instanceof Error || (messages instanceof Array && messages.some((part) => part instanceof Error));

  if (containsError) console.warn(...messages);
  else console.log(...messages);
};

export default LogMessageOrError;
