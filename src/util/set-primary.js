const OPACITY = 0.5;

/**
 * @param {string} hex
 * @param {number} [opacity=1]
 * @returns {string}
 */
const HexToRGBA = (hex, opacity = 1) =>
  `rgba(${hex
    .replace(/^#/, '')
    .match(/\w{1,2}/g)
    .map((color) => parseInt(color, 16))
    .join(', ')}, ${opacity})`;

const styleBlockWithPrimary =
  document.getElementById('primary') || document.head.appendChild(document.createElement('style'));
styleBlockWithPrimary.id = 'style-block-with-primary';
styleBlockWithPrimary.innerHTML = `:root {
  --primary: ${process.env.REACT_APP_PRIMARY_COLOR};
  --primary-faded: ${HexToRGBA(process.env.REACT_APP_PRIMARY_COLOR, OPACITY)};
}`;
