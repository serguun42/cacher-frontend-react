import dispatcher from './dispatcher';
import LogMessageOrError from './log';

const CACHE_STORAGE_NAME = 'cacher_react_cache_storage';

/**
 * @param {boolean} showMessage
 * @returns {void}
 */
export const ClearCache = () => {
  caches
    .delete(CACHE_STORAGE_NAME)
    .then(() => {
      dispatcher.call('message', 'Кэш очищен');
    })
    .catch((e) => {
      LogMessageOrError(e);

      dispatcher.call('message', 'Ошибка при очистке кэша');
    });

  if ('serviceWorker' in navigator)
    navigator.serviceWorker.getRegistrations().then((registered) => registered.forEach((sw) => sw.unregister()));
};

dispatcher.link('clearCache', ClearCache);

if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production')
  navigator.serviceWorker.register(`/${process.env.REACT_APP_SITE_CODE}/service-worker.js`, {
    scope: `/${process.env.REACT_APP_SITE_CODE}/`,
  });

window.addEventListener('load', () => {
  fetch(`/${process.env.REACT_APP_SITE_CODE}/build_hash`)
    .then((res) => {
      if (res.status === 200) return res.text();
      return Promise.reject(new Error(`Status code ${res.status} ${res.statusText}`));
    })
    .then((versionFileContents) => {
      if (versionFileContents.trim() !== process.env.REACT_APP_BUILD_HASH) ClearCache(true);
    })
    .catch(LogMessageOrError);
});

export default {
  ClearCache,
};
