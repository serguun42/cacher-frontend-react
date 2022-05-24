import { Animation } from './animations';
import LogMessageOrError from './log';

/**
 * @param {HTMLElement} originElem
 * @returns {Promise<boolean>}
 */
export default function OpenSearch(originElem) {
  if (!originElem) return Promise.resolve(false);

  const rect = originElem.getBoundingClientRect();
  const initialWidth = rect.width;
  const initialHeight = rect.height;
  const initialTop = rect.top;
  const initialLeft = rect.left;
  const initialBorderRadius = parseInt(getComputedStyle(originElem).borderRadius) || 0;
  const finalWidth = window.innerWidth;
  const finalHeight = window.innerHeight;
  const primaryColor =
    getComputedStyle(document.body).getPropertyValue('--primary')?.trim() || process.env.REACT_APP_PRIMARY_COLOR;
  const animatingZone = document.createElement('div');

  animatingZone.style.display = 'block';
  animatingZone.style.position = 'fixed';
  animatingZone.style.backgroundColor = primaryColor;

  animatingZone.style.width = `${initialWidth}px`;
  animatingZone.style.height = `${initialHeight}px`;
  animatingZone.style.top = `${initialTop}px`;
  animatingZone.style.left = `${initialLeft}px`;
  animatingZone.style.borderRadius = `${initialBorderRadius}px`;
  animatingZone.style.zIndex = 100;

  document.body.appendChild(animatingZone);

  return new Promise((resolve) => {
    Animation(
      400,
      (progress) => {
        animatingZone.style.width = `${initialWidth + (finalWidth - initialWidth) * progress}px`;
        animatingZone.style.height = `${initialHeight + (finalHeight - initialHeight) * progress}px`;
        animatingZone.style.top = `${initialTop * (1 - progress)}px`;
        animatingZone.style.left = `${initialLeft * (1 - progress)}px`;
        if (progress > 0.7)
          animatingZone.style.borderRadius = `${initialBorderRadius * (1 - (progress - 0.7) / 0.3)}px`;
      },
      'ease-out'
    )
      .then(() => {
        resolve(true);
        return Animation(300, (progress) => {
          animatingZone.style.opacity = 1 - progress;
        });
      })
      .then(() => animatingZone.remove())
      .catch(LogMessageOrError);
  });
}
