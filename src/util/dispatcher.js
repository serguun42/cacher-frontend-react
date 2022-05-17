/* eslint-disable no-underscore-dangle */

class Dispatcher {
  constructor() {
    /** @type {{[eventName: string]: Function[]}} */
    this._listeners = {};
  }

  /**
   * Add callback for certain event
   *
   * @param {string} eventName
   * @param {Function} eventHandler
   * @returns {void}
   */
  link(eventName, eventHandler) {
    if (!this._listeners[eventName]?.length) this._listeners[eventName] = [];

    this._listeners[eventName].push(eventHandler);
  }

  /**
   * Add callback for any event call
   *
   * @param {(eventName: string, ...argsForHandler: any[]) => void} eventHandler
   * @returns {void}
   */
  onAny(eventHandler) {
    if (!this._listeners.onAny?.length) this._listeners.onAny = [];

    this._listeners.onAny.push(eventHandler);
  }

  /**
   * Remove callback (needs **SAME** function) from event call
   *
   * @param {string} eventName
   * @param {Function} eventHandler
   * @returns {void}
   */
  unlink(eventName, eventHandler) {
    if (!this._listeners[eventName]?.length) return;

    this._listeners[eventName] = this._listeners[eventName].filter(
      (filteringHandler) => filteringHandler !== eventHandler
    );
  }

  /**
   * Clear all listeners for all events (optionally `removeOnAnyToo`) or just for one or for every except excluded.
   *
   * @param {string} [eventName]
   * @param {{exclude?: string[], removeOnAnyToo?: boolean}} [clearingOptions]
   * @returns {void}
   */
  clear(eventName, clearingOptions) {
    if (eventName) {
      if (eventName === '*') {
        if (!clearingOptions) clearingOptions = {};
        if (!clearingOptions.exclude) clearingOptions.exclude = [];
        if (!clearingOptions.removeOnAnyToo) clearingOptions.exclude.push('onAny');

        Object.keys(this._listeners).forEach((key) => {
          if (!clearingOptions.exclude.includes(key)) delete this._listeners[key];
        });
      } else this._listeners[eventName] = [];
    } else this._listeners = {};
  }

  /**
   * Dispatch event – calls every listeners for this event with `...argsForHandler` and `onAny`
   *
   * @param {string} eventName
   * @param {any[]} argsForHandler
   * @returns {void}
   */
  call(eventName, ...argsForHandler) {
    if (!this._listeners[eventName]?.length) this._listeners[eventName] = [];

    this._listeners[eventName].forEach((eventHandler) => eventHandler(...argsForHandler));

    if (this._listeners.onAny?.length)
      this._listeners.onAny.forEach((eventHandler) => eventHandler(eventName, ...argsForHandler));
  }
}

export default new Dispatcher();
