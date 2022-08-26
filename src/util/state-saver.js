/* eslint-disable no-underscore-dangle */

class StateSaver {
  constructor() {
    /** @type {{[stateName: string]: any}} */
    this._state = {};
  }

  /**
   * Save state
   *
   * @param {string} stateName
   * @param {any} stateValue
   * @returns {void}
   */
  save(stateName, stateValue) {
    this._state[stateName] = stateValue;
  }

  /**
   * Append state (concat arrays, objects, etc.)
   *
   * @param {string} stateName
   * @param {any} appendingValue
   * @returns {void}
   */
  append(stateName, appendingValue) {
    if (!this._state[stateName]) this._state[stateName] = appendingValue;
    else if (Array.isArray(this._state[stateName]))
      this._state[stateName] = this._state[stateName].concat(appendingValue);
    else if (typeof this._state[stateName] === 'object')
      this._state[stateName] = { ...this._state[stateName], ...appendingValue };
    else this._state[stateName] += appendingValue;
  }

  /**
   * Get saved state
   *
   * @param {string} stateName
   * @returns {any}
   */
  get(stateName) {
    return this._state[stateName];
  }

  /**
   * Extract saved state by its name (with deletion)
   *
   * @param {string} stateName
   * @param {boolean} [removeAfter] Whether to delete after accessing
   * @returns {any}
   */
  extract(stateName) {
    const temp = this._state[stateName];
    delete this._state[stateName];
    return temp;
  }

  /**
   * Extract saved state by its name (with deletion)
   *
   * @param {string} stateName
   * @param {boolean} [removeAfter] Whether to delete after accessing
   * @returns {void}
   */
  remove(stateName) {
    delete this._state[stateName];
  }

  /**
   * Wipe every saved state
   *
   * @returns {void}
   */
  wipe() {
    this._state = {};
  }
}

export default new StateSaver();
