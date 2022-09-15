/* eslint-disable no-empty */
/**
 * @param {string | URL} urlLike
 * @returns {URL}
 */
export default function SafeURL(urlLike) {
  if (urlLike instanceof URL) return urlLike;
  if (!urlLike || typeof urlLike !== 'string') return new URL(window.location.origin);

  try {
    const url = new URL(urlLike);
    url.pathname = url.pathname.replace(/\/+/g, '/');
    return url;
  } catch (e) {}

  try {
    const url = new URL(urlLike, window.location.origin);
    url.pathname = url.pathname.replace(/\/+/g, '/');
    return url;
  } catch (e) {}

  return new URL(window.location.origin);
}
