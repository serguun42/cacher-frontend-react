const IS_MOBILE =
  /android|ios|iphone/i.test(navigator.userAgent) || window.innerWidth < 600 || 'ontouchstart' in window;

export default IS_MOBILE;
