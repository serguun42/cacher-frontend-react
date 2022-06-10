import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import dispatcher from '../util/dispatcher';
import Ripple from './Ripple';
import './InputArea.css';

/**
 * @typedef {Object} InputAreaProps
 * @property {string} [preset]
 * @property {string} label
 * @property {import("react").SetStateAction<string>} setState
 * @property {() => {}} [enterHandler]
 * @property {boolean} [autofocus]
 * @property {boolean} [noMargin]
 */
/**
 * @param {InputAreaProps} props
 */
export default function InputArea({ preset, label, setState, enterHandler, autofocus, noMargin }) {
  const [isDirty, setIsDirty] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [inputId] = useState(`${Math.floor(Math.random() * 1e8)}${Date.now()}`);
  /** @type {import("react").MutableRefObject<HTMLInputElement>} */
  const inputRef = useRef(null);

  /** @param {InputEvent} e */
  const OnInput = (e) => {
    /** @type {{ value: string }} */
    const { value } = e.target;

    setIsDirty(!!value);
    setState(value || '');
  };
  /** @param {KeyboardEvent} */
  const OnKeyUp = (e) => {
    if (e.code === 'Enter' || e.key === 'Enter') if (typeof enterHandler === 'function') enterHandler(e);
  };

  const OnFocus = () => {
    setIsFocused(true);
    dispatcher.call('deactivateHotkeys');
  };

  const OnBlur = () => {
    setIsFocused(false);
    dispatcher.call('activateHotkeys');
  };

  const ClearButtonHandler = () => {
    setIsDirty(false);
    setState('');
    if (inputRef?.current) inputRef.current.value = null;
  };

  useEffect(() => {
    if (!inputRef.current) return;

    if (preset) {
      inputRef.current.value = preset;
      setIsDirty(true);
    }

    if (autofocus) inputRef.current.focus();
  }, [inputRef.current]);

  useEffect(() => () => dispatcher.call('activateHotkeys'), []);

  return (
    <div className={`field-area ${noMargin ? 'field-area--no-margin' : ''}`}>
      <div
        className={`field-area__textfield ${isDirty ? 'field-area__textfield--is-dirty' : ''} ${
          isFocused ? 'field-area__textfield--is-focused' : ''
        }`}
      >
        <input
          className="field-area__textfield__input"
          id={`field-area__textfield__input-${inputId}`}
          type="text"
          inputMode="text"
          onInput={OnInput}
          onFocus={OnFocus}
          onBlur={OnBlur}
          onKeyUp={OnKeyUp}
          ref={inputRef}
        />
        <label className="field-area__textfield__label" htmlFor={`field-area__textfield__input-${inputId}`}>
          {label}
        </label>
        <div className="field-area__textfield__input-border" />
        <div className="field-area__textfield__input-dashed-border" />
      </div>
      {isDirty && (
        <div className="field-area__icon default-pointer" onClick={ClearButtonHandler}>
          <span className="material-icons">clear</span>
          <Ripple />
        </div>
      )}
    </div>
  );
}

InputArea.propTypes = {
  preset: PropTypes.string,
  label: PropTypes.string.isRequired,
  setState: PropTypes.func.isRequired,
  enterHandler: PropTypes.func,
  autofocus: PropTypes.bool,
  noMargin: PropTypes.bool,
};

InputArea.defaultProps = {
  preset: '',
  enterHandler: () => {},
  autofocus: true,
  noMargin: false,
};
