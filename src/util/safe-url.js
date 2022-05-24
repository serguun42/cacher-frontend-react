/* eslint-disable no-empty */
/**
 * @param {string} urlLike
 * @returns {URL}
 */
export default function SafeURL(urlLike) {
  if (!urlLike || typeof urlLike !== 'string') return new URL(`https://${process.env.REACT_APP_SITE_LINK}`);

  try {
    const url = new URL(urlLike);
    url.pathname = url.pathname.replace(/\/+/g, '/');
    return url;
  } catch (e) {}

  try {
    const url = new URL(urlLike, `https://${process.env.REACT_APP_SITE_LINK}`);
    url.pathname = url.pathname.replace(/\/+/g, '/');
    return url;
  } catch (e) {}

  return new URL(`https://${process.env.REACT_APP_SITE_LINK}`);
}
