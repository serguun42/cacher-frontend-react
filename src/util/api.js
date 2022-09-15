import dispatcher from './dispatcher';
import LogMessageOrError from './log';
import PopupNoLogin from './popups/no-login';
import PopupNoPermission from './popups/no-permission';
import stateSaver from './state-saver';

const API_VERSION = 'v1.1';
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

    Object.keys(queries).forEach((queryName) => {
      if (queries[queryName]) builtURL.searchParams.set(queryName, queries[queryName]);
    });

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
  const builtURL = BuildURL(method, queries);

  if (stateSaver.get(builtURL)) return Promise.resolve(JSON.parse(stateSaver.get(builtURL)));

  return fetch(builtURL, options).then(
    /** @param {Response} res */ (res) => {
      if (res.status === 401) PopupNoLogin();
      else if (res.status === 403) PopupNoPermission();
      else if (res.status === 429) dispatcher.call('message', 'Слишком много запросов ⌛');

      try {
        return res.json().then((response) => {
          if (response?.error) return Promise.reject(response);

          stateSaver.save(builtURL, JSON.stringify(response));
          return Promise.resolve(response);
        });
      } catch (e) {
        LogMessageOrError(e);
        return Promise.reject(res.status);
      }
    }
  );
};

/**
 * @returns {Promise<import("../../types/stats_response").StatsResponse>}
 */
export const GetFeedStats = () => FetchMethod('feed/stats');

/**
 * @param {number} [skip] How many posts to skip
 * @returns {Promise<import("../../types/feed_post").FeedPost[]>}
 */
export const GetFeedLastPosts = (skip = 0) => FetchMethod('feed/last', { skip });

/**
 * @param {number} entryId
 * @returns {Promise<import("../../types/entry").Entry>}
 */
export const GetEntry = (entryId) => FetchMethod('entry', { entryId });

/**
 * @param {number} entityId
 * @returns {Promise<import("../../types/entity_names").EntityNamesAndAvatarsResponse>}
 */
export const GetEntityNames = (entityId) => FetchMethod('entity/names', { entityId });

/**
 * @param {number} entryId
 * @returns {Promise<import("../../types/feed_post").FeedPost[]>}
 */
export const SearchByPostId = (entryId) => FetchMethod('search/entry', { entryId });

/**
 * @typedef {Object} SearchDefaultFilter
 * @property {number} [skip] How many posts to skip
 * @property {string} [date-start] Limit by date, starting with this parameter (inclusively)
 * @property {string} [date-end] Limit by date, ending with this parameter (inclusively)
 */
/**
 * @param {{ entityId: number } & SearchDefaultFilter} searchByEntityIdFilter
 * @returns {Promise<import("../../types/feed_post").FeedPost[]>}
 */
export const SearchByEntityId = (searchByEntityIdFilter) => FetchMethod('search/entity', { ...searchByEntityIdFilter });

/**
 * @param {{ url: string } & SearchDefaultFilter} searchByUrlFilter
 * @returns {Promise<import("../../types/feed_post").FeedPost[]>}
 */
export const SearchByUrl = (searchByUrlFilter) => FetchMethod('search/url', { ...searchByUrlFilter });

/**
 * @typedef {Object} SearchTextFilter
 * @property {string} text
 * @property {boolean} [regex] Search with regex, passed in param "text"
 * @property {boolean} [case-sensetive] Search case-sensetively (applicable both for plain text and regex)
 */
/**
 * @param {SearchTextFilter & SearchDefaultFilter} searchByTextFilter
 * @returns {Promise<import("../../types/feed_post").FeedPost[]>}
 */
export const SearchByText = (searchByTextFilter) => FetchMethod('search/text', { ...searchByTextFilter });
