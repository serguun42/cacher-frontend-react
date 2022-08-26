const IS_SAFARI =
  navigator.userAgent.search('Safari') > -1 &&
  navigator.userAgent.search('Chrome') === -1 &&
  navigator.userAgent.search(/OPR/i) === -1 &&
  navigator.userAgent.search('Edg') === -1 &&
  navigator.userAgent.search('Firefox') === -1;

/**
 * Creates valid avatar mini-preview for layout
 * @param {string} avatarUrl
 * @param {boolean} [bigger=false] Pass `true` for 200x200
 * @returns {string}
 */
export default function Avatar(avatarUrl, bigger = false) {
  if (!avatarUrl) avatarUrl = `https://${process.env.REACT_APP_CDN_DOMAIN}/2b1829fb-5f49-494f-b193-7a4257bde6f0/`;

  return `url("${avatarUrl}${
    avatarUrl.indexOf(process.env.REACT_APP_CDN_DOMAIN) > -1
      ? `-/scale_crop/${bigger ? '200x200' : '64x64'}/-/format/${IS_SAFARI ? 'jpg' : 'webp'}/`
      : ''
  }")`;
}
