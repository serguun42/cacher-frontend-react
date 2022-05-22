/**
 * Creates valid avatar mini-preview for layout
 * @param {string} avatarUrl
 * @param {boolean} [bigger=false] Pass `true` for 200x200
 * @returns {string}
 */
export default function Avatar(avatarUrl, bigger = false) {
  return `url("${avatarUrl}${
    avatarUrl.indexOf(process.env.REACT_APP_CDN_DOMAIN) > -1
      ? `-/format/jpg/-/scale_crop/${bigger ? '200x200' : '64x64'}/`
      : ''
  }")`;
}
