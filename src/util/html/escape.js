/**
 * @param {string} string
 * @returns {string}
 */
export default function Esc(string) {
  if (typeof string !== 'string') return '';

  return string.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
