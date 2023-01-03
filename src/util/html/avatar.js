const IS_SAFARI =
  navigator.userAgent.search('Safari') > -1 &&
  navigator.userAgent.search('Chrome') === -1 &&
  navigator.userAgent.search(/OPR/i) === -1 &&
  navigator.userAgent.search('Edg') === -1 &&
  navigator.userAgent.search('Firefox') === -1;

const CDN_ESSENTIAL_RX = new RegExp(
  process.env.REACT_APP_CDN_DOMAIN.replace(/\.\w+$/, '')
    .replace(/[^a-z]/gi, '.*')
    .replace(/(\.\*)+/gi, '.*')
);

/**
 * Creates valid avatar mini-preview for layout
 * @param {string} avatarUrl
 * @param {boolean} [bigger=false] Pass `true` for 200x200
 * @returns {string}
 */
export default function Avatar(avatarUrl, bigger = false) {
  if (!avatarUrl) avatarUrl = `https://${process.env.REACT_APP_CDN_DOMAIN}/2b1829fb-5f49-494f-b193-7a4257bde6f0/`;

  const isCDN = CDN_ESSENTIAL_RX.test(avatarUrl);
  if (!isCDN) return `url("${avatarUrl}")`;

  return `url("${avatarUrl}${`-/scale_crop/${bigger ? '200x200' : '64x64'}/${IS_SAFARI ? '' : '-/format/webp/'}`}")`;
}
