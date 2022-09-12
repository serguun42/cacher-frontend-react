const DEFAULT_TITLE = `Cacher ${process.env.REACT_APP_SITE_SHORT}`;

/**
 * Resets app's title to default `"Cacher SOMETHING"`
 *
 * @returns {void}
 */
export function ResetTitle() {
  document.title = DEFAULT_TITLE;
}

/**
 * Sets app's title to custom value then adds default `"Cacher SOMETHING"`
 *
 * @param {string} customTitle
 * @param {boolean} [disableDefault] If `true` does not concat with `"Cacher SOMETHING"`
 * @returns {void}
 */
export function CustomTitle(customTitle, disableDefault = false) {
  if (!customTitle) return ResetTitle();

  if (disableDefault) document.title = customTitle;
  else document.title = `${customTitle} — ${DEFAULT_TITLE}`;
}
