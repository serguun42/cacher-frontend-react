import HTMLReactParser from 'html-react-parser';
import sanitize from 'sanitize-html';

/**
 * @param {string} raw
 * @returns {import("react").Component}
 */
export default function Refined(raw) {
  if (!raw) return '';
  if (typeof raw !== 'string') return '';

  const modified = raw
    .trim()
    .replace(/<br>/g, '\n')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\\#/g, '#')
    .replace(/\\_/g, '_')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, b, c) => {
      return `<a href="${c.replace(/#/g, '\u00ad\u00ad\u00ad#')}" target="_blank" rel="noopener noreferrer">${b.replace(
        /#/g,
        '\u00ad\u00ad\u00ad#'
      )}</a>`;
    })
    .replace(/#([\p{L}\w]+)([^\p{L}\w]|$)/giu, (a, b, _, d, e) => {
      if (!(e.slice(d - 3, d) === '\u00ad\u00ad\u00ad'))
        // eslint-disable-next-line max-len
        return `<a href="https://${process.env.REACT_APP_SITE_LINK}/tag/${b}" target="_blank" rel="noopener noreferrer">#${b}</a> `;
      return a;
    })
    .replace(new RegExp(`\\\\(<a href="https://${process.env.REACT_APP_SITE_LINK}/tag/)`, 'g'), '$1')
    .replace(/\\\*/g, '✱')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/\*([^*]+)\*/g, '<i>$1</i>')
    .replace(/==([^*=]+)==/g, `<span class='bc-decoration'>$1</span>`)
    .replace(/\\(\[|\])/g, '$1')
    .replace(/\\(\.|-|\)|\()/g, '$1')
    .replace(/&lt;([^>]{10,})&gt;/g, (a, b) => {
      try {
        const url = new URL(b);
        return `<a href="${url.href}" target="_blank" rel="noopener noreferrer">${url.href}</a>`;
      } catch (e) {
        return a;
      }
    })
    .replace(/\n/g, '<br>');

  return HTMLReactParser(
    sanitize(modified, {
      allowedTags: sanitize.defaults.allowedTags,
      allowedAttributes: {
        ...sanitize.defaults.allowedAttributes,
        a: (sanitize.defaults.allowedAttributes.a || []).concat(['rel']),
        span: ['class'],
      },
    }),
    {
      // eslint-disable-next-line consistent-return
      replace(domNode) {
        if (domNode.type === 'script' || domNode.name === 'string') return null;
      },
    }
  );
}
