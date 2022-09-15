/* eslint-disable no-restricted-globals */
// eslint-disable-next-line import/no-extraneous-dependencies
import SafeURL from './util/safe-url';

/** @type {ServiceWorker & Window & typeof globalThis} */

self.addEventListener('activate', () => {});

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(process.env.REACT_APP_CACHE_STORAGE_NAME)
      .then((cache) => cache.addAll([`/${process.env.REACT_APP_SITE_CODE}/`]))
  );
});

self.addEventListener('beforeinstallprompt', () => {});

/**
 * Fetch network resource and put result in cache if needed
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
const fromNetwork = (request) =>
  fetch(request).then((response) => {
    if (response.status === 200)
      caches
        .open(process.env.REACT_APP_CACHE_STORAGE_NAME)
        .then((cache) => cache.put(request, response.clone()))
        // eslint-disable-next-line no-console
        .catch(console.warn);

    return response.clone();
  });

/**
 * Find resource from cache any reponse with it if found
 *
 * @param {Request} request
 */
const fromCache = (request) =>
  caches
    .open(process.env.REACT_APP_CACHE_STORAGE_NAME)
    .then((cache) => cache.match(request))
    .then((matching) => {
      if (matching) return Promise.resolve(matching);
      return Promise.reject(new Error('No match in cache'));
    });

self.addEventListener(
  'fetch',
  /** @param {Event & { request: Request, respondWith: (Promise<Response>) => void }} event */ (event) => {
    const { request } = event;

    if (request.method !== 'GET') return fetch(request);

    const parsedURL = SafeURL(request.url || '');

    if (parsedURL.origin !== self.location.origin) return fetch(request);
    if (parsedURL.pathname.search(`/${process.env.REACT_APP_SITE_CODE}/build_hash`) > -1) return fetch(request);

    if (parsedURL.pathname === `/${process.env.REACT_APP_SITE_CODE}`)
      parsedURL.pathname = `/${process.env.REACT_APP_SITE_CODE}/`;

    const apiCalledFlag = /^\/api\//i.test(parsedURL.pathname);
    if (apiCalledFlag)
      return event.respondWith(
        fromNetwork(request)
          .catch(() => fromCache(request))
          .catch((e) => {
            // eslint-disable-next-line no-console
            console.warn(e);
            return new Response('');
          })
      );

    return event.respondWith(
      fromCache(request)
        .catch(() => fromNetwork(request))
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.warn(e);
          return new Response('');
        })
    );
  }
);
