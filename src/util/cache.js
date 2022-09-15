import dispatcher from './dispatcher';
import LogMessageOrError from './log';

/**
 * @param {boolean} showMessage
 * @returns {void}
 */
export default function ClearCache() {
  caches
    .delete(process.env.REACT_APP_CACHE_STORAGE_NAME)
    .then(() => {
      dispatcher.call('message', 'Кэш очищен');
    })
    .catch((e) => {
      LogMessageOrError(e);

      dispatcher.call('message', 'Ошибка при очистке кэша');
    });

  if ('serviceWorker' in navigator)
    navigator.serviceWorker.getRegistrations().then((registered) => registered.forEach((sw) => sw.unregister()));
}

dispatcher.link('clearCache', ClearCache);

if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator)
    navigator.serviceWorker
      .register(`/${process.env.REACT_APP_SITE_CODE}/service-worker.js`, {
        scope: `/${process.env.REACT_APP_SITE_CODE}/`,
      })
      .catch(LogMessageOrError);

  fetch(`/${process.env.REACT_APP_SITE_CODE}/build_hash`)
    .then((res) => {
      if (res.status === 200) return res.text();
      return Promise.reject(new Error(`Status code ${res.status} ${res.statusText}`));
    })
    .then((versionFileContents) => {
      if (versionFileContents.trim() !== process.env.REACT_APP_BUILD_HASH) ClearCache();
    })
    .catch(LogMessageOrError);
}
