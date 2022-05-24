/**
 * @callback AnimationStyleSettingFunc
 * @param {number} iProgress
 */
/**
 * @param {number} duration
 * @param {AnimationStyleSettingFunc} styleCallback - Function for setting props by progress
 * @param {"ease-in-out"|"ease-in-out-slow"|"ease-in"|"ease-out"|"ripple"|"linear"} [curve="ease-in-out"] - Curve Style
 * @param {number} [skip=0] - How many of progress to skip, ranges from `0` to `1`
 * @returns {Promise<null>}
 */
export const Animation = (duration, styleCallback, curve = 'ease-in-out', skip = 0) =>
  new Promise((resolve) => {
    const startTime = performance.now();

    function LocalAnimation(passedTime) {
      let calcedProgress = (passedTime - startTime > 0 ? passedTime - startTime : 0) / duration + skip;

      if (calcedProgress < 1) {
        if (curve === 'ease-in-out') {
          if (calcedProgress < 0.5) calcedProgress = (calcedProgress * 2) ** 2.75 / 2;
          else calcedProgress = 1 - ((1 - calcedProgress) * 2) ** 2.75 / 2;
        } else if (curve === 'ease-in-out-slow') {
          if (calcedProgress < 0.5) calcedProgress = (calcedProgress * 2) ** 2.25 / 2;
          else calcedProgress = 1 - ((1 - calcedProgress) * 2) ** 2.25 / 2;
        } else if (curve === 'ease-in') {
          calcedProgress **= 1.75;
        } else if (curve === 'ease-out') {
          calcedProgress = 1 - (1 - calcedProgress) ** 1.75;
        } else if (curve === 'ripple') {
          calcedProgress = 0.6 * calcedProgress ** (1 / 3) + 1.8 * calcedProgress ** (2 / 3) - 1.4 * calcedProgress;
        }

        styleCallback(calcedProgress);

        requestAnimationFrame(LocalAnimation);
      } else {
        styleCallback(1);

        return resolve();
      }
    }

    requestAnimationFrame(LocalAnimation);
  });

/**
 * @typedef {Object} AnimationsOptionsType
 * @property {"block" | "flex" | "etc"} [display]
 * @property {number} [initialOpacity]
 */
/**
 * @param {HTMLElement} elem
 * @param {number} duration
 * @param {AnimationsOptionsType} [options]
 * @returns {Promise<string>}
 */
export const FadeIn = (elem, duration, options = {}) => {
  if (!elem || !(elem instanceof HTMLElement)) return Promise.resolve();
  if (!options) options = {};
  if (!options.initialOpacity) options.initialOpacity = 0;
  if (!options.display) options.display = 'block';

  elem.style.opacity = options.initialOpacity;
  elem.style.display = options.display;

  return Animation(
    duration,
    (iProgress) => {
      elem.style.opacity = (1 - options.initialOpacity) * iProgress + options.initialOpacity;
    },
    'ease-in-out'
  ).then(() => {
    elem.style.opacity = 1;
    return Promise.resolve('Done FadeIn');
  });
};

/**
 * @param {HTMLElement} elem
 * @param {number} duration
 * @param {AnimationsOptionsType} [options]
 * @returns {Promise<string>}
 */
export const FadeOut = (elem, duration, options) => {
  if (!elem || !(elem instanceof HTMLElement)) return Promise.resolve();
  if (!options) options = {};
  if (!options.initialOpacity) options.initialOpacity = 1;

  elem.style.opacity = options.initialOpacity;

  return Animation(
    duration,
    (iProgress) => {
      elem.style.opacity = (1 - iProgress) * options.initialOpacity;
    },
    'ease-in-out'
  ).then(() => {
    elem.style.opacity = 0;
    elem.style.display = 'none';
    return Promise.resolve('Done FadeOut');
  });
};

/**
 * @param {HTMLElement} elem
 * @param {number} duration
 * @param {AnimationsOptionsType} [options]
 * @param {AnimationStyleSettingFunc} [styleCallback]
 * @returns {Promise<string>}
 */
export const SlideDown = (elem, duration, options = {}, styleCallback = null) => {
  if (!elem || !(elem instanceof HTMLElement)) return Promise.resolve();
  if (!options) options = {};
  if (!options.display) options.display = 'block';

  const finalHeight =
    parseInt(elem.dataset.targetHeight || getComputedStyle(elem).height || '0') ||
    (() => {
      elem.style.opacity = 0;
      elem.style.display = options.display;
      const heightGorFromTweak = parseInt(elem.dataset.targetHeight || getComputedStyle(elem).height || '0') || 0;
      elem.style.display = 'none';
      elem.style.opacity = 1;
      return heightGorFromTweak;
    })() ||
    0;

  const marginTop = parseInt(getComputedStyle(elem).marginTop || '0') || 0;
  const marginBottom = parseInt(getComputedStyle(elem).marginBottom || '0') || 0;
  const paddingTop = parseInt(getComputedStyle(elem).paddingTop || '0') || 0;
  const paddingBottom = parseInt(getComputedStyle(elem).paddingTop || '0') || 0;

  elem.style.display = options.display;
  elem.style.overflow = 'hidden';
  elem.style.height = 0;
  elem.style.marginTop = 0;
  elem.style.marginBottom = 0;
  elem.style.paddingTop = 0;
  elem.style.paddingBottom = 0;
  elem.dataset.targetHeight = finalHeight;

  return Animation(
    duration,
    (iProgress) => {
      elem.style.height = `${iProgress * finalHeight}px`;
      elem.style.marginTop = `${iProgress * marginTop}px`;
      elem.style.marginBottom = `${iProgress * marginBottom}px`;
      elem.style.paddingTop = `${iProgress * paddingTop}px`;
      elem.style.paddingBottom = `${iProgress * paddingBottom}px`;

      if (styleCallback) styleCallback(iProgress);
    },
    'ease-in-out'
  ).then(() => {
    elem.style.height = `${finalHeight}px`;
    elem.style.removeProperty('height');
    elem.style.removeProperty('overflow');
    elem.style.removeProperty('margin-top');
    elem.style.removeProperty('margin-bottom');
    elem.style.removeProperty('padding-top');
    elem.style.removeProperty('padding-bottom');
    return Promise.resolve('Done SlideDown');
  });
};

/**
 * @param {HTMLElement} elem
 * @param {number} duration
 * @param {AnimationStyleSettingFunc} [styleCallback]
 * @returns {Promise<string>}
 */
export const SlideUp = (elem, duration, styleCallback) => {
  if (!elem || !(elem instanceof HTMLElement)) return Promise.resolve();

  const initSize = elem.clientHeight;
  const marginTop = parseInt(getComputedStyle(elem).marginTop || '0') || 0;
  const marginBottom = parseInt(getComputedStyle(elem).marginBottom || '0') || 0;
  const paddingTop = parseInt(getComputedStyle(elem).paddingTop || '0') || 0;
  const paddingBottom = parseInt(getComputedStyle(elem).paddingTop || '0') || 0;

  elem.style.overflow = 'hidden';

  return Animation(
    duration,
    (iProgress) => {
      elem.style.height = `${(1 - iProgress) * initSize}px`;
      elem.style.marginTop = `${(1 - iProgress) * marginTop}px`;
      elem.style.marginBottom = `${(1 - iProgress) * marginBottom}px`;
      elem.style.paddingTop = `${(1 - iProgress) * paddingTop}px`;
      elem.style.paddingBottom = `${(1 - iProgress) * paddingBottom}px`;

      if (styleCallback) styleCallback(iProgress);
    },
    'ease-in-out'
  ).then(() => {
    elem.style.display = 'none';
    elem.style.removeProperty('height');
    elem.style.removeProperty('overflow');
    elem.style.removeProperty('margin-top');
    elem.style.removeProperty('margin-bottom');
    elem.style.removeProperty('padding-top');
    elem.style.removeProperty('padding-bottom');
    return Promise.resolve('Done SlideUp');
  });
};

export default {
  Animation,
  FadeIn,
  FadeOut,
  SlideDown,
  SlideUp,
};
