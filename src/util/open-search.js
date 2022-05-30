import { Animation } from './animations';
import LogMessageOrError from './log';

/**
 * @param {HTMLElement} originElem
 * @returns {Promise<boolean>}
 */
export default function OpenSearch(originElem) {
  if (!originElem) return Promise.resolve(false);

  const PRIMARY_COLOR =
    getComputedStyle(document.body).getPropertyValue('--primary')?.trim() || process.env.REACT_APP_PRIMARY_COLOR;
  const SPLASH_COLOR = getComputedStyle(document.body).getPropertyValue('--text')?.trim();

  const originRect = originElem.getBoundingClientRect();
  const originWidth = originRect.width;
  const originHeight = originRect.height;
  const originTop = originRect.top;
  const originLeft = originRect.left;
  const originBorderRadius = parseInt(getComputedStyle(originElem).borderRadius) || 0;

  const interSize = Math.min(
    window.innerWidth > window.innerHeight ? window.innerHeight / 2 : window.innerWidth / 2,
    300
  );
  const interWidth = interSize;
  const interHeight = interSize;
  const interBorderRadius = interSize / 2;
  const interTop = (window.innerHeight - interSize) / 2;
  const interLeft = (window.innerWidth - interSize) / 2;

  /** ALLO YOBA ETO TI?? */
  const yellowRoundAtCenter = document.createElement('div');
  const searchIcon = yellowRoundAtCenter.appendChild(document.createElement('i'));
  searchIcon.className = 'material-icons';
  searchIcon.innerHTML = 'search';
  searchIcon.style.position = 'absolute';
  searchIcon.style.top = '50%';
  searchIcon.style.left = '50%';
  searchIcon.style.transform = 'translate(-50%, -50%)';
  searchIcon.style.color = 'var(--button-text)';

  yellowRoundAtCenter.style.display = 'block';
  yellowRoundAtCenter.style.position = 'fixed';
  yellowRoundAtCenter.style.backgroundColor = PRIMARY_COLOR;

  yellowRoundAtCenter.style.width = `${originWidth}px`;
  yellowRoundAtCenter.style.height = `${originHeight}px`;
  yellowRoundAtCenter.style.top = `${originTop}px`;
  yellowRoundAtCenter.style.left = `${originLeft}px`;
  yellowRoundAtCenter.style.borderRadius = `${originBorderRadius}px`;
  yellowRoundAtCenter.style.zIndex = 101;

  document.body.appendChild(yellowRoundAtCenter);

  return new Promise((resolve) => {
    Animation(
      300,
      (progress) => {
        yellowRoundAtCenter.style.width = `${originWidth + (interWidth - originWidth) * progress}px`;
        yellowRoundAtCenter.style.height = `${originHeight + (interHeight - originHeight) * progress}px`;
        yellowRoundAtCenter.style.top = `${originTop + (interTop - originTop) * progress}px`;
        yellowRoundAtCenter.style.left = `${originLeft + (interLeft - originLeft) * progress}px`;
        yellowRoundAtCenter.style.borderRadius = `${
          originBorderRadius + (interBorderRadius - originBorderRadius) * progress
        }px`;
      },
      'ease-in-out-slow'
    )
      .then(() => {
        const finalSize = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
        const finalWidth = finalSize;
        const finalHeight = finalSize;
        const finalTop = (window.innerHeight - finalSize) / 2;
        const finalLeft = (window.innerWidth - finalSize) / 2;

        const splashIntoBackground = document.createElement('div');

        splashIntoBackground.style.display = 'block';
        splashIntoBackground.style.position = 'fixed';
        splashIntoBackground.style.backgroundColor = SPLASH_COLOR;

        splashIntoBackground.style.width = `${interWidth}px`;
        splashIntoBackground.style.height = `${interHeight}px`;
        splashIntoBackground.style.top = `${interTop}px`;
        splashIntoBackground.style.left = `${interLeft}px`;
        splashIntoBackground.style.borderRadius = '50%';
        splashIntoBackground.style.zIndex = 100;

        document.body.appendChild(splashIntoBackground);

        return Animation(
          350,
          (progress) => {
            splashIntoBackground.style.width = `${interWidth + (finalWidth - interWidth) * progress}px`;
            splashIntoBackground.style.height = `${interHeight + (finalHeight - interHeight) * progress}px`;
            splashIntoBackground.style.top = `${interTop + (finalTop - interTop) * progress}px`;
            splashIntoBackground.style.left = `${interLeft + (finalLeft - interLeft) * progress}px`;
          },
          'ripple'
        ).then(() => {
          resolve(true);

          return Animation(250, (progress) => {
            yellowRoundAtCenter.style.opacity = 1 - progress;
            splashIntoBackground.style.opacity = 1 - progress;
          }).then(() => {
            yellowRoundAtCenter.remove();
            splashIntoBackground.remove();
          });
        });
      })
      .catch(LogMessageOrError);
  });
}
