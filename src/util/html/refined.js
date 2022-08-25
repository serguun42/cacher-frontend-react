import HTMLReactParser from 'html-react-parser';
import sanitize from 'sanitize-html';
import SafeURL from '../safe-url';

/**
 * @param {string} readyHtml
 * @returns {string | JSX.Element | JSX.Element[]}
 */
export function StraightRefined(readyHtml) {
  return HTMLReactParser(
    sanitize(readyHtml, {
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
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      /**
       * @param {string} _wholeMatch Whole string
       * @param {string} linkTitle
       * @param {string} linkUrl
       * @returns {string}
       */
      (_wholeMatch, linkTitle, linkUrl) => {
        const escapedTitle = linkTitle.replace(/#/g, '\u00ad\u00ad\u00ad#');
        const escapedUrl = linkUrl.replace(/#/g, '\u00ad\u00ad\u00ad#');
        const filteredUrl = new RegExp(`^https?://${process.env.REACT_APP_SITE_LINK}/redirect`, 'i').test(escapedUrl)
          ? SafeURL(escapedUrl).searchParams.get('url') || escapedUrl
          : escapedUrl;

        if (/^\u00ad\u00ad\u00ad#/i.test(filteredUrl)) {
          const anchorUrl = new URL(window.location);
          anchorUrl.hash = filteredUrl.replace(/\u00ad\u00ad\u00ad#/i, '\u2028\u2028\u2028');
          return `<a href="${anchorUrl.href}" target="_blank" rel="noopener noreferrer">${escapedTitle}</a>`;
        }

        return `<a href="${filteredUrl}" target="_blank" rel="noopener noreferrer">${escapedTitle}</a>`;
      }
    )
    .replace(/#([\p{L}\w]+)([^\p{L}\w]|$)/giu, (wholeMatch, tag, _afterTag, tagStartIndex, entireString) => {
      if (!(entireString.slice(tagStartIndex - 3, tagStartIndex) === '\u00ad\u00ad\u00ad'))
        // eslint-disable-next-line max-len
        return `<a href="https://${process.env.REACT_APP_SITE_LINK}/tag/${tag}" target="_blank" rel="noopener noreferrer">#${tag}</a> `;

      return wholeMatch;
    })
    .replace(/%E2%80%A8%E2%80%A8%E2%80%A8/g, '')
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

  return StraightRefined(modified);
}
