/* eslint-disable */
const CACHE_STORAGE_NAME = 'cacher_react_cache_storage';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_STORAGE_NAME).then((cache) => cache.addAll(['/tj/', '/dtf/'])));
});

self.addEventListener('activate', () => {});

self.addEventListener('beforeinstallprompt', () => {});

/**
 * Fetch network resource and put result in cache if needed
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
function fromNetwork(request) {
  const requestedURL = new URL(request.url);

  const putToCacheFlag =
    requestedURL.origin === self.location.origin &&
    [/\/$/, /\.(woff2|woff|ttf|js|css|png|json)$/i].some((regexp) => regexp.test(requestedURL.pathname));

  if (!putToCacheFlag) return fetch(request);

  return fetch(request).then((response) => {
    if (response.status === 200)
      caches
        .open(CACHE_STORAGE_NAME)
        .then((cache) => cache.put(request, response.clone()))
        .catch(console.warn);

    return response.clone();
  });
}

/**
 * **From Cache**
 *
 * @param {Request} request
 */
function fromCache(request) {
  return caches
    .open(CACHE_STORAGE_NAME)
    .then((cache) => cache.match(request))
    .then((matching) => {
      if (matching) return matching;
      return Promise.reject('no-match');
    });
}

self.addEventListener(
  'fetch',
  /** @param {Event & { request: Request, respondWith: (Promise<Response>) => void }} event */ (event) => {
    const { request } = event;

    if (request.method !== 'GET') return fetch(request);

    let apiCalledFlag = false;

    try {
      const parsedURL = new URL(request.url || '', 'https://cacher.serguun42.ru');

      if (/^\/api\//i.test(parsedURL.pathname)) apiCalledFlag = true;
    } catch (e) {}

    if (apiCalledFlag) event.respondWith(fromNetwork(request).catch(() => fromCache(request)));
    else event.respondWith(fromCache(request).catch(() => fromNetwork(request)));
  }
);
