import LogMessageOrError from './log';

const API_VERSION = 'v1';
const API_ROOT = new URL(`/api/${API_VERSION}/${process.env.REACT_APP_SITE_CODE}/`, window.location.origin);

/**
 * @param {string} method
 * @param {{ [queryName: string]: string | true }} queries
 * @param {URL} [root]
 * @returns {string}
 */
const BuildURL = (method, queries, root = API_ROOT) => {
  try {
    const builtURL = new URL(method, root);

    Object.keys(queries).forEach((queryName) => builtURL.searchParams.set(queryName, queries[queryName]));

    return builtURL.href;
  } catch (e) {
    LogMessageOrError(e);
    return API_ROOT.href;
  }
};

/**
 * @param {string} method
 * @param {{ [queryName: string]: string | true }} [queries]
 * @param {RequestInit} [options]
 * @returns {Promise<import("../types").DefaultError>}
 */
export const FetchMethod = (method, queries = {}, options = {}) => {
  return fetch(BuildURL(method, queries), options).then((res) => {
    try {
      return res.json();
    } catch (e) {
      LogMessageOrError(e);
      return Promise.reject(res.status);
    }
  });
};

/**
 * @returns {Promise<import("../../types/stats_response").StatsResponse>}
 */
export const FeedStats = () => FetchMethod('feed/stats');

/**
 * @param {number} [skip] How many posts to skip
 * @returns {Promise<import("../../types/feed_post").FeedPost[]>}
 */
export const FeedLastPosts = (skip = 0) => FetchMethod('feed/last', { skip });
