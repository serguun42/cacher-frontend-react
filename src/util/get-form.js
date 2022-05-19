/**
 * @param {number} count
 * @param {[string, string, string]} forms
 * @returns {string}
 */
export default function GetForm(count, forms) {
  count = count.toString();

  if (count.slice(-2)[0] === '1' && count.length > 1) return forms[2];
  if (count.slice(-1) === '1') return forms[0];
  if (/2|3|4/g.test(count.slice(-1))) return forms[1];
  if (/5|6|7|8|9|0/g.test(count.slice(-1))) return forms[2];

  return '';
}
